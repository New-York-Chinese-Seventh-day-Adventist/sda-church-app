import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const {
  SETTING_KEYS,
  loadConfig,
  planCaptures,
  orderCaptures,
  buildManifest,
  planAppStore,
  manifestPath,
  statusBarClear,
} = require('../scripts/capture-ios-screens.cjs');

const repoFile = (path: string) => readFileSync(resolve(__dirname, '..', path), 'utf8');
const config = loadConfig();
const shots = planCaptures(config);

describe('key screen list (test/screens/screens.json)', () => {
  it('names every screen once, with at least one known variant', () => {
    const names = config.screens.map((screen: { name: string }) => screen.name);
    expect(new Set(names).size).toBe(names.length);
    for (const screen of config.screens) {
      expect(screen.name).toMatch(/^[a-z0-9-]+$/);
      expect(screen.variants.length).toBeGreaterThan(0);
      for (const variant of screen.variants) expect(config.variants).toHaveProperty(variant);
    }
  });

  it('leaves out screens that show members’ names or photos', () => {
    // The repository and its pull requests are public.
    for (const screen of config.screens) {
      expect(screen.path).not.toMatch(/bulletin|team|fellowship|worship/);
    }
  });

  it('reproduces the iPhone bugs fixed in 0.42.0', () => {
    const names = shots.map((shot: { name: string }) => shot.name);
    // Three-digit verse numbers at the largest text size, text scrolled under
    // the status bar, and the header with two translations and a back arrow.
    expect(names).toEqual(
      expect.arrayContaining(['bible-long-chapter-xl', 'bible-scrolled-default', 'bible-dual-back-large']),
    );
    const scrolled = shots.find((shot: { name: string }) => shot.name === 'bible-scrolled-default');
    expect(scrolled.checks).toContain('statusBarClear');
    expect(scrolled.url).toContain('verseStart=14');
  });

  it('only uses checks the script knows', () => {
    for (const shot of shots) for (const check of shot.checks) expect(check).toBe('statusBarClear');
  });

  it('gives every shot a stable, unique file name', () => {
    const files = shots.map((shot: { file: string }) => shot.file);
    expect(new Set(files).size).toBe(files.length);
    expect(files).toContain('ios/home-default.png');
    expect(files).toContain('ios/bible-dual-large.png');
    expect(files).toContain('ios/library-es.png');
  });

  it('opens each screen with the app’s deep link scheme', () => {
    const scheme = JSON.parse(repoFile('app.json')).expo.scheme;
    for (const shot of shots) expect(shot.url.startsWith(`${scheme}://`)).toBe(true);
    expect(shots.find((shot: { file: string }) => shot.file === 'ios/explore-default.png').url).toBe(
      'sdachurchapp://explore',
    );
  });
});

describe('capture order', () => {
  it('takes every shot once, grouping those with the same settings into one launch', () => {
    const ordered = orderCaptures(shots);
    expect(ordered).toHaveLength(shots.length);
    expect(new Set(ordered.map((shot: { name: string }) => shot.name)).size).toBe(shots.length);
    const launches = ordered.filter((shot: { coldStart: boolean }) => shot.coldStart).length;
    expect(launches).toBeLessThan(shots.length);
    // Within a launch, the settings never change.
    let current = '';
    for (const shot of ordered) {
      const settings = JSON.stringify(shot.settings, Object.keys(shot.settings).sort());
      if (shot.coldStart) current = settings;
      else expect(settings).toBe(current);
    }
  });
});

describe('App Store shots', () => {
  const copies = planAppStore(config);

  it('numbers each language’s shots in upload order', () => {
    expect(copies[0]).toEqual({ name: 'bible-dual-default', file: 'app-store/en-US/01-bible-dual-default.png' });
    expect(copies.map((copy: { file: string }) => copy.file)).toContain('app-store/zh-Hant/01-bible-cuv-zh.png');
  });

  it('only names shots that are captured, up to the App Store’s ten', () => {
    const names = new Set(shots.map((shot: { name: string }) => shot.name));
    for (const copy of copies) expect(names.has(copy.name)).toBe(true);
    for (const list of Object.values(config.appStore) as string[][]) {
      expect(list.length).toBeGreaterThanOrEqual(3);
      expect(list.length).toBeLessThanOrEqual(10);
    }
  });
});

describe('saved settings', () => {
  it('uses storage keys the app still reads', () => {
    const sources = [
      'app/_layout.tsx',
      'app/(tabs)/bible/index.tsx',
      'constants/Themes.ts',
      'constants/AppPreferences.ts',
    ]
      .map(repoFile)
      .join('\n');
    for (const key of Object.values(SETTING_KEYS)) expect(sources).toContain(`'${key}'`);
  });

  it('skips setup and fixes the language, theme, and text size for every shot', () => {
    for (const shot of shots) {
      const manifest = buildManifest(shot.settings);
      expect(manifest['has-completed-setup']).toBe('true');
      expect(manifest['user-language']).toMatch(/^(en|zh|zh-cn|es)$/);
      expect(manifest['user-theme']).toMatch(/^(light|dark)$/);
      expect(Number(manifest['user-text-scale'])).toBeGreaterThanOrEqual(1);
    }
  });

  it('applies the variant on top of the screen’s own settings', () => {
    const shot = shots.find((candidate: { file: string }) => candidate.file === 'ios/bible-pinyin-zh.png');
    expect(buildManifest(shot.settings)).toEqual({
      'has-completed-setup': 'true',
      'user-language': 'zh',
      'user-theme': 'light',
      'user-text-scale': '1',
      'user-bible-dual-language': 'true',
      'user-bible-supporting-translation': 'BSB',
      'user-bible-show-pinyin': 'true',
    });
    const large = shots.find((candidate: { file: string }) => candidate.file === 'ios/bible-dual-large.png');
    expect(buildManifest(large.settings)['user-text-scale']).toBe('1.5');
  });

  it('turns off dual-language reading and pinyin for the single-translation shot', () => {
    // The Bible reader treats a missing value as on.
    const shot = shots.find((candidate: { file: string }) => candidate.file === 'ios/bible-default.png');
    const manifest = buildManifest(shot.settings);
    expect(manifest['user-bible-dual-language']).toBe('false');
    expect(manifest['user-bible-show-pinyin']).toBe('false');
  });

  it('keeps the iPhone’s own text size out of the app’s storage', () => {
    const shot = shots.find((candidate: { name: string }) => candidate.name === 'bible-dual-ios-large-text');
    expect(shot.settings.iosTextSize).toBe('accessibility-large');
    expect(Object.values(buildManifest(shot.settings))).not.toContain('accessibility-large');
  });

  it('rejects a setting it has no storage key for', () => {
    expect(() => buildManifest({ fontSize: 2 })).toThrow('Unknown setting "fontSize"');
  });

  it('writes where AsyncStorage keeps short values on iOS', () => {
    expect(manifestPath('/data', 'org.nyccsda.app')).toBe(
      '/data/Library/Application Support/org.nyccsda.app/RCTAsyncLocalStorage_V1/manifest.json',
    );
  });
});

describe('iOS PR preview', () => {
  const workflow = repoFile('.github/workflows/ios-pr-preview.yml');

  it('captures the key screens once, on the Apple Silicon build', () => {
    expect(workflow).toContain('node scripts/capture-ios-screens.cjs --out');
    expect(workflow).toMatch(/Capture the key screens\n(?:\s+#.*\n)*\s+if: matrix\.arch == 'arm64'/);
  });

  it('reads no secrets and keeps a read-only token', () => {
    expect(workflow).not.toMatch(/secrets\./);
    expect(workflow).toMatch(/permissions:\n\s+contents: read\n/);
  });
});

describe('status bar check', () => {
  const sharp = require('sharp');
  const { mkdtempSync } = require('node:fs');
  const { tmpdir } = require('node:os');
  const { join } = require('node:path');
  const dir = mkdtempSync(join(tmpdir(), 'screens-'));

  const screenshot = async (name: string, withText: boolean) => {
    const file = join(dir, `${name}.png`);
    const width = 1320;
    const overlays = withText
      ? [{ input: Buffer.from('<svg width="600" height="60"><text x="0" y="45" font-size="44">For God so loved</text></svg>'), left: 420, top: 40 }]
      : [];
    await sharp({ create: { width, height: 2868, channels: 3, background: '#f3e6df' } })
      .composite(overlays)
      .png()
      .toFile(file);
    return file;
  };

  it('passes when the status bar sits on a plain backdrop', async () => {
    expect(await statusBarClear(await screenshot('clear', false))).toBe(true);
  });

  it('fails when text shows through behind the status bar', async () => {
    expect(await statusBarClear(await screenshot('overlap', true))).toBe(false);
  });
});

describe('Screenshot review', () => {
  const workflow = repoFile('.github/workflows/screenshot-review.yml');

  it('runs only for the release PR into main', () => {
    expect(workflow).toMatch(/pull_request:\n\s+branches:\n\s+- main/);
    expect(workflow).toContain("startsWith(github.head_ref, 'release/')");
    expect(workflow).toContain('github.event.pull_request.head.repo.full_name == github.repository');
  });

  it('passes only with the label, and clears it on a new push', () => {
    expect(workflow).toContain("contains(github.event.pull_request.labels.*.name, 'screenshots reviewed')");
    expect(workflow).toMatch(/"\$ACTION" = synchronize/);
    expect(workflow).toContain('labels/screenshots%20reviewed');
  });

  it('never runs pull request code or reads a secret', () => {
    expect(workflow).not.toMatch(/actions\/checkout|secrets\./);
    expect(workflow).not.toMatch(/pull_request_target/);
    // Pull request text reaches the script only through environment variables.
    const script = workflow.slice(workflow.indexOf('run: |'));
    expect(script).not.toMatch(/\$\{\{/);
  });

  it('keeps the job name the ruleset will require', () => {
    expect(workflow).toContain('name: Screenshots reviewed');
  });
});
