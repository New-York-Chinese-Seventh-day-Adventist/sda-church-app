#!/usr/bin/env node
/**
 * Captures the app's key screens (test/screens/screens.json) from a Simulator
 * build, for the iOS PR preview (#331). The images are named
 * ios/<screen>-<variant>.png, and a later change can compare them with
 * known-good copies. The App Store shots are also copied, numbered in upload
 * order, to app-store/<language>/.
 *
 * The app shows a setup dialog on its first launch, and the Simulator can't tap
 * it away. So before each group of shots this saves the settings the app reads
 * at startup straight into its AsyncStorage file, marking setup as done and
 * choosing the language, theme, and text size. It then opens each screen by
 * deep link. Shots with the same settings share one launch.
 *
 *   node scripts/capture-ios-screens.cjs --pick-device   Prints the configured iPhone's UDID, creating it if needed
 *   node scripts/capture-ios-screens.cjs --out <dir>     Captures every screen into <dir>
 *
 * The app must already be installed on that iPhone. The Simulator only runs on
 * macOS with Xcode.
 */
const { execFileSync, spawnSync } = require('node:child_process');
const { appendFileSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');

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

// Settings of the simulated iPhone rather than the app.
const DEVICE_SETTINGS = ['iosTextSize'];

// Every shot starts from these, so nothing depends on the time of day (the
// Sunrise/Sunset theme) or on the Simulator's own language and text size.
const BASE_SETTINGS = {
  setupDone: true,
  language: 'en',
  theme: 'light',
  textScale: 1,
  iosTextSize: 'large',
};

// Seconds to wait after opening a screen: longer when the app starts cold.
const COLD_WAIT = 14;
const WARM_WAIT = 6;

const loadConfig = (file = join(projectRoot, 'test/screens/screens.json')) =>
  JSON.parse(readFileSync(file, 'utf8'));

/** Lists every shot: its name, file, deep link, settings, and checks. */
const planCaptures = (config) =>
  config.screens.flatMap((screen) =>
    screen.variants.map((variant) => {
      const overrides = config.variants[variant];
      if (!overrides) throw new Error(`Screen "${screen.name}" uses unknown variant "${variant}".`);
      return {
        name: `${screen.name}-${variant}`,
        file: `ios/${screen.name}-${variant}.png`,
        url: `${SCHEME}://${screen.path}`,
        settings: { ...BASE_SETTINGS, ...(screen.settings || {}), ...overrides },
        checks: screen.checks || [],
        wait: screen.wait,
      };
    }),
  );

const settingsKey = (settings) =>
  JSON.stringify(Object.keys(settings).sort().map((name) => [name, settings[name]]));

/**
 * Orders shots so those with the same settings run together, keeping the
 * screen list's order otherwise, and marks which ones need a fresh launch.
 */
const orderCaptures = (shots) => {
  const groups = new Map();
  for (const shot of shots) {
    const key = settingsKey(shot.settings);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(shot);
  }
  return [...groups.values()].flatMap((group) =>
    group.map((shot, index) => ({ ...shot, coldStart: index === 0 })),
  );
};

/** The AsyncStorage manifest: every value is a string, keyed by its storage key. */
const buildManifest = (settings) =>
  Object.fromEntries(
    Object.entries(settings)
      .filter(([name]) => !DEVICE_SETTINGS.includes(name))
      .map(([name, value]) => {
        const key = SETTING_KEYS[name];
        if (!key) throw new Error(`Unknown setting "${name}".`);
        return [key, String(value)];
      }),
  );

/** The App Store copies: app-store/<language>/<NN>-<shot>.png, in upload order. */
const planAppStore = (config) =>
  Object.entries(config.appStore || {}).flatMap(([language, names]) =>
    names.map((name, index) => ({
      name,
      file: `app-store/${language}/${String(index + 1).padStart(2, '0')}-${name}.png`,
    })),
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

const largestSpread = (stats) => Math.max(...stats.channels.map((channel) => channel.stdev));

// A screenshot of a crashed app or an unloaded screen is one flat colour.
const looksBlank = async (file) => {
  const sharp = require('sharp');
  return largestSpread(await sharp(file).stats()) < 3;
};

/**
 * Whether the status bar's middle stays one colour. With a scrolled screen, text
 * that shows through behind the status bar makes it uneven. The time sits on
 * the left and the icons on the right, so only the middle is checked.
 */
const statusBarClear = async (file) => {
  const sharp = require('sharp');
  const { width } = await sharp(file).metadata();
  const region = {
    left: Math.round(width * 0.3),
    top: Math.round(width * 0.015),
    width: Math.round(width * 0.4),
    height: Math.round(width * 0.09),
  };
  // sharp's stats() measures the whole input, not the crop, so crop into a new image first.
  const crop = await sharp(file).extract(region).png().toBuffer();
  return largestSpread(await sharp(crop).stats()) < 6;
};

const CHECKS = { statusBarClear };

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
  const captured = new Set();
  const started = Date.now();

  for (const shot of orderCaptures(planCaptures(config))) {
    if (shot.coldStart) {
      spawnSync('xcrun', ['simctl', 'terminate', udid, bundleId]); // Not running is fine.
      const manifest = manifestPath(dataContainer, bundleId);
      mkdirSync(dirname(manifest), { recursive: true });
      writeFileSync(manifest, JSON.stringify(buildManifest(shot.settings)));
      simctl('ui', udid, 'appearance', shot.settings.theme === 'dark' ? 'dark' : 'light');
      simctl('ui', udid, 'content_size', shot.settings.iosTextSize);
      // Launch the app itself: a deep link to an app that isn't running doesn't
      // reliably start it in the Simulator.
      simctl('launch', udid, bundleId);
      await sleep(COLD_WAIT);
    }
    // The app opens on Home, so a Home shot right after launch needs no link.
    const atHome = shot.coldStart && shot.url === `${SCHEME}://`;
    if (!atHome) {
      simctl('openurl', udid, shot.url);
      await sleep(shot.wait || WARM_WAIT);
    }

    const file = join(outDir, shot.file);
    mkdirSync(dirname(file), { recursive: true });
    // The whole rectangular screen: no rounded corners or Dynamic Island cutout,
    // as the App Store expects. Taken even when something went wrong, so the
    // artifact shows what was on screen.
    simctl('io', udid, 'screenshot', '--type=png', '--mask=ignored', file);
    const problems = [];
    if (!isRunning(udid, bundleId)) problems.push(`the app wasn't running after opening ${shot.url}`);
    if (await looksBlank(file)) problems.push('the screen is blank');
    for (const check of shot.checks) {
      if (!CHECKS[check]) problems.push(`unknown check "${check}"`);
      else if (!(await CHECKS[check](file))) problems.push(`failed ${check}`);
    }
    if (problems.length) failures.push(`${shot.file}: ${problems.join(', ')}`);
    else captured.add(shot.name);
    console.log(`${shot.file} <- ${shot.url}${problems.length ? `  (${problems.join(', ')})` : ''}`);
  }

  for (const copy of planAppStore(config)) {
    if (!captured.has(copy.name)) {
      failures.push(`${copy.file}: its shot "${copy.name}" wasn't captured`);
      continue;
    }
    const file = join(outDir, copy.file);
    mkdirSync(dirname(file), { recursive: true });
    copyFileSync(join(outDir, `ios/${copy.name}.png`), file);
  }

  const minutes = ((Date.now() - started) / 60000).toFixed(1);
  const summary = [
    `### Key screens (${device.name}, ${device.runtime})`,
    '',
    `${captured.size} captured in ${minutes} minutes, in the Apple Silicon artifact's \`screens/\` folder,`,
    'with the App Store shots in `screens/app-store/`.',
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

module.exports = {
  SETTING_KEYS,
  BASE_SETTINGS,
  loadConfig,
  planCaptures,
  orderCaptures,
  buildManifest,
  planAppStore,
  manifestPath,
  statusBarClear,
};
