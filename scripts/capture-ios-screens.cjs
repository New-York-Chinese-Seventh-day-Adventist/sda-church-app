#!/usr/bin/env node
/**
 * Captures the app's key screens (test/screens/screens.json) from a Simulator
 * build, for the iOS PR preview (#331). The images are named
 * ios/<screen>-<variant>.png, and a later change can compare them with
 * known-good copies.
 *
 * The app shows a setup dialog on its first launch, and the Simulator can't tap
 * it away. So before each shot this saves the settings the app reads at startup
 * straight into its AsyncStorage file, marking setup as done and choosing the
 * language, theme, and text size. It then opens the screen by deep link.
 *
 *   node scripts/capture-ios-screens.cjs --pick-device   Prints the configured iPhone's UDID, creating it if needed
 *   node scripts/capture-ios-screens.cjs --out <dir>     Captures every screen into <dir>/ios/
 *
 * The app must already be installed on that iPhone. The Simulator only runs on
 * macOS with Xcode.
 */
const { execFileSync, spawnSync } = require('node:child_process');
const { mkdirSync, readFileSync, writeFileSync, appendFileSync } = require('node:fs');
const { join, resolve } = require('node:path');

const projectRoot = resolve(__dirname, '..');
const SCHEME = 'sdachurchapp';

// The AsyncStorage keys the app reads at startup. test/screens.test.ts checks
// that each one still appears in the app's source.
const SETTING_KEYS = {
  setupDone: 'has-completed-setup',
  language: 'user-language',
  theme: 'user-theme',
  textScale: 'user-text-scale',
  dualLanguage: 'user-bible-dual-language',
  supportingTranslation: 'user-bible-supporting-translation',
  pinyin: 'user-bible-show-pinyin',
};

// Every shot starts from these, so nothing depends on the time of day (the
// Sunrise/Sunset theme) or the Simulator's own language.
const BASE_SETTINGS = { setupDone: true, language: 'en', theme: 'light', textScale: 1 };

const loadConfig = (file = join(projectRoot, 'test/screens/screens.json')) =>
  JSON.parse(readFileSync(file, 'utf8'));

/** Lists every shot: its file name, deep link, and the settings to save first. */
const planCaptures = (config) =>
  config.screens.flatMap((screen) =>
    screen.variants.map((variant) => {
      const overrides = config.variants[variant];
      if (!overrides) throw new Error(`Screen "${screen.name}" uses unknown variant "${variant}".`);
      return {
        file: `ios/${screen.name}-${variant}.png`,
        url: `${SCHEME}://${screen.path}`,
        settings: { ...BASE_SETTINGS, ...(screen.settings || {}), ...overrides },
        wait: screen.wait || 12,
      };
    }),
  );

/** The AsyncStorage manifest: every value is a string, keyed by its storage key. */
const buildManifest = (settings) =>
  Object.fromEntries(
    Object.entries(settings).map(([name, value]) => {
      const key = SETTING_KEYS[name];
      if (!key) throw new Error(`Unknown setting "${name}".`);
      return [key, String(value)];
    }),
  );

// AsyncStorage keeps short values inline in this file (see RNCAsyncStorage.mm).
const manifestPath = (dataContainer, bundleId) =>
  join(dataContainer, 'Library', 'Application Support', bundleId, 'RCTAsyncLocalStorage_V1', 'manifest.json');

const simctl = (...args) => execFileSync('xcrun', ['simctl', ...args], { encoding: 'utf8' }).trim();

const newestRuntime = () => {
  const { runtimes } = JSON.parse(simctl('list', 'runtimes', '--json'));
  const ios = runtimes.filter(
    (runtime) => runtime.identifier.includes('SimRuntime.iOS-') && runtime.isAvailable,
  );
  const version = (runtime) => runtime.version.split('.').map(Number);
  ios.sort((a, b) => version(b)[0] - version(a)[0] || (version(b)[1] || 0) - (version(a)[1] || 0));
  if (!ios.length) throw new Error('No iOS Simulator runtime is installed.');
  return ios[0];
};

/** The configured iPhone on the newest iOS runtime, created if the runner lacks one. */
const pickDevice = (config) => {
  const name = config.ios.device;
  const runtime = newestRuntime();
  const { devices } = JSON.parse(simctl('list', 'devices', 'available', '--json'));
  const existing = (devices[runtime.identifier] || []).find((device) => device.name === name);
  if (existing) return { udid: existing.udid, name, runtime: runtime.name };
  const { devicetypes } = JSON.parse(simctl('list', 'devicetypes', '--json'));
  const type = devicetypes.find((candidate) => candidate.name === name);
  if (!type) throw new Error(`This Xcode has no "${name}" Simulator; update ios.device in test/screens/screens.json.`);
  return { udid: simctl('create', name, type.identifier, runtime.identifier), name, runtime: runtime.name };
};

const sleep = (seconds) => new Promise((done) => setTimeout(done, seconds * 1000));

const isRunning = (udid, bundleId) =>
  simctl('spawn', udid, 'launchctl', 'list').includes(`UIKitApplication:${bundleId}`);

// A screenshot of a crashed app or an unloaded screen is one flat colour.
const looksBlank = async (file) => {
  const sharp = require('sharp');
  const { channels } = await sharp(file).stats();
  return Math.max(...channels.map((channel) => channel.stdev)) < 3;
};

const capture = async (outDir) => {
  const config = loadConfig();
  const bundleId = JSON.parse(readFileSync(join(projectRoot, 'app.json'), 'utf8')).expo.ios.bundleIdentifier;
  const device = pickDevice(config);
  const { udid } = device;
  spawnSync('xcrun', ['simctl', 'boot', udid]); // Already booted is fine.
  simctl('bootstatus', udid, '-b');
  // A fixed status bar, so the images differ only when the app does.
  simctl('status_bar', udid, 'override', '--time', '9:41', '--dataNetwork', 'wifi', '--wifiMode', 'active',
    '--wifiBars', '3', '--cellularMode', 'active', '--cellularBars', '4', '--batteryState', 'charged',
    '--batteryLevel', '100');
  const dataContainer = simctl('get_app_container', udid, bundleId, 'data');
  const failures = [];
  const captured = [];

  for (const shot of planCaptures(config)) {
    spawnSync('xcrun', ['simctl', 'terminate', udid, bundleId]); // Not running is fine.
    const manifest = manifestPath(dataContainer, bundleId);
    mkdirSync(join(manifest, '..'), { recursive: true });
    writeFileSync(manifest, JSON.stringify(buildManifest(shot.settings)));
    simctl('ui', udid, 'appearance', shot.settings.theme === 'dark' ? 'dark' : 'light');
    simctl('openurl', udid, shot.url);
    await sleep(shot.wait);

    const file = join(outDir, shot.file);
    mkdirSync(join(file, '..'), { recursive: true });
    if (!isRunning(udid, bundleId)) {
      failures.push(`${shot.file}: the app wasn't running after opening ${shot.url}`);
      continue;
    }
    // The whole rectangular screen: no rounded corners or Dynamic Island cutout,
    // as the App Store expects.
    simctl('io', udid, 'screenshot', '--type=png', '--mask=ignored', file);
    if (await looksBlank(file)) failures.push(`${shot.file}: the screen is blank`);
    else captured.push(shot.file);
    console.log(`${shot.file} <- ${shot.url}`);
  }

  const summary = [
    `### Key screens (${device.name}, ${device.runtime})`,
    '',
    `${captured.length} captured into the artifact's \`screens/\` folder.`,
    ...failures.map((failure) => `- ❌ ${failure}`),
    '',
  ].join('\n');
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  console.log(summary);
  if (failures.length) process.exitCode = 1;
};

if (require.main === module) {
  if (process.argv.includes('--pick-device')) {
    console.log(pickDevice(loadConfig()).udid);
  } else {
    const outIndex = process.argv.indexOf('--out');
    const outDir = outIndex === -1 ? undefined : process.argv[outIndex + 1];
    if (!outDir) {
      console.error('Usage: node scripts/capture-ios-screens.cjs --pick-device | --out <dir>');
      process.exit(2);
    }
    capture(resolve(outDir)).catch((error) => {
      console.error(error);
      process.exit(1);
    });
  }
}

module.exports = { SETTING_KEYS, BASE_SETTINGS, loadConfig, planCaptures, buildManifest, manifestPath };
