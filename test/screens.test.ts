import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const {
  SETTING_KEYS,
  loadConfig,
  planCaptures,
  buildManifest,
  manifestPath,
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
