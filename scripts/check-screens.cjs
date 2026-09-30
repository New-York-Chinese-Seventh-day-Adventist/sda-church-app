#!/usr/bin/env node
/**
 * Checks the key-screen screenshots for things every screen must show, by
 * reading their text with Apple's Vision framework (scripts/ocr-screens.swift,
 * macOS only) and applying rules (#331):
 *
 * - every screen shows the four tab labels in the shot's language;
 * - no screen shows a system prompt, the setup dialog, or a code value such as
 *   "undefined";
 * - Bible screens show the verse button's whole label, not a cut-off "V";
 * - a screen's own `mustShowLines` rules in test/screens/screens.json match the
 *   start of some line, which catches a verse number split across two lines.
 *
 *   node scripts/check-screens.cjs --dir <screens folder>   The folder holding ios/*.png
 *
 * Writes ocr.json and checks.json into that folder, and a summary to the step
 * summary. Exits 1 if any rule fails.
 */
const { execFileSync } = require('node:child_process');
const { appendFileSync, existsSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { loadConfig, planCaptures } = require('./capture-ios-screens.cjs');

// Vision's languages for each app language, most important first. Bible screens
// in English also show Chinese, so English reads both.
const OCR_LANGUAGES = {
  en: ['en-US', 'zh-Hant'],
  zh: ['zh-Hant', 'en-US'],
  'zh-cn': ['zh-Hans', 'en-US'],
  es: ['es-ES', 'en-US'],
};

// The tab bar's labels, from app/(tabs)/_layout.tsx.
const TAB_LABELS = {
  en: ['Home', 'Bible', 'Explore', 'You'],
  zh: ['首頁', '聖經', '探索', '您'],
  'zh-cn': ['首页', '圣经', '探索', '您'],
  es: ['Inicio', 'Biblia', 'Explorar', 'Tú'],
};

// The Bible's verse button, from app/(tabs)/bible/index.tsx.
const VERSE_BUTTON = { en: 'Verse', zh: '節', 'zh-cn': '节', es: 'Versículo' };

// Text that means something went wrong: a system prompt over the app, the
// first-launch setup, or a value the app failed to fill in.
const NEVER_SHOWN = ['Open in', 'Get Started', 'Welcome', 'undefined', 'NaN', '[object Object]'];

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A label counts only as a whole word: "Verse" doesn't count inside "Verses".
// Chinese has no spaces between words, so any occurrence counts there.
const showsLabel = (lines, label) => {
  const pattern = /[㐀-鿿]/.test(label)
    ? new RegExp(escape(label))
    : new RegExp(`(^|[^\\p{L}])${escape(label)}($|[^\\p{L}])`, 'u');
  return lines.some((line) => pattern.test(line.text));
};

/** Returns what's wrong with one shot, given the lines of text read from it. */
const checkShot = (shot, lines) => {
  const language = shot.settings.language;
  const problems = [];
  if (shot.tabs !== false) {
    const missing = TAB_LABELS[language].filter((label) => !showsLabel(lines, label));
    if (missing.length) problems.push(`tab labels missing: ${missing.join(', ')}`);
  }
  for (const text of NEVER_SHOWN) {
    if (lines.some((line) => line.text.includes(text))) problems.push(`shows "${text}"`);
  }
  if (shot.route.startsWith('bible') && !showsLabel(lines, VERSE_BUTTON[language])) {
    problems.push(`the verse button doesn't show "${VERSE_BUTTON[language]}"`);
  }
  for (const rule of shot.mustShowLines || []) {
    if (!lines.some((line) => new RegExp(rule, 'u').test(line.text.trim()))) {
      problems.push(`no line matches /${rule}/`);
    }
  }
  return problems;
};

/** Reads every shot's text, one Vision call per language set. */
const readText = (dir, shots) => {
  const groups = new Map();
  for (const shot of shots) {
    const file = join(dir, shot.file);
    if (!existsSync(file)) continue;
    const languages = OCR_LANGUAGES[shot.settings.language].join(',');
    if (!groups.has(languages)) groups.set(languages, []);
    groups.get(languages).push(file);
  }
  const text = {};
  for (const [languages, files] of groups) {
    const output = execFileSync(
      'xcrun',
      ['swift', join(__dirname, 'ocr-screens.swift'), languages, ...files],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    Object.assign(text, JSON.parse(output));
  }
  return text;
};

const main = () => {
  const dirIndex = process.argv.indexOf('--dir');
  const dir = dirIndex === -1 ? undefined : resolve(process.argv[dirIndex + 1]);
  if (!dir) {
    console.error('Usage: node scripts/check-screens.cjs --dir <screens folder>');
    process.exit(2);
  }
  const config = loadConfig();
  const shots = planCaptures(config).map((shot) => {
    const screen = config.screens.find((candidate) => shot.name.startsWith(`${candidate.name}-`));
    return { ...shot, tabs: screen?.tabs, mustShowLines: screen?.mustShowLines };
  });
  const text = readText(dir, shots);
  writeFileSync(join(dir, 'ocr.json'), JSON.stringify(text, null, 1));

  const results = shots.map((shot) => {
    const lines = text[join(dir, shot.file)];
    return { file: shot.file, problems: lines ? checkShot(shot, lines) : ['no screenshot'] };
  });
  writeFileSync(join(dir, 'checks.json'), JSON.stringify(results, null, 1));
  const failed = results.filter((result) => result.problems.length);
  const summary = [
    '### Key-screen text checks',
    '',
    `${results.length - failed.length} of ${results.length} screenshots pass.`,
    ...failed.map((result) => `- ❌ ${result.file}: ${result.problems.join('; ')}`),
    '',
  ].join('\n');
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  console.log(summary);
  if (failed.length) process.exitCode = 1;
};

if (require.main === module) main();

module.exports = { OCR_LANGUAGES, TAB_LABELS, VERSE_BUTTON, NEVER_SHOWN, showsLabel, checkShot };
