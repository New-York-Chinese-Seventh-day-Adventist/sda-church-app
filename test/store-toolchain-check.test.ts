const {
  evaluateStoreToolchain,
  htmlToText,
  parseAndroidTargetRequirements,
  parseAppleLatestXcode,
  parseAppleXcodeRequirements,
  readAppToolchain,
} = require('../scripts/check-store-toolchain.cjs');

// Sentences as they appear on the official pages, fetched 2026-09-27.
const ANDROID_TEXT =
  'Starting August 31 2026: New apps and app updates must target Android 16 (API level 36) or higher to be submitted to Google Play; except for Wear OS and Android Automotive OS apps, which must target Android 15 (API level 35) or higher. ' +
  'Existing apps must target Android 15 (API level 35) or higher to remain available to new users.';
const APPLE_TEXT =
  'SDK minimum requirements Since April 28, 2026 Apps uploaded to App Store Connect must be built with Xcode 26 or later using an SDK for iOS 26 , iPadOS 26 , tvOS 26 , visionOS 26 , or watchOS 26 .';

const app = { androidTargetApi: 36, androidCompileApi: 37, xcodeVersion: '26.2' };
const day = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe('store toolchain page parsing', () => {
  it('reads the phone target API requirement and ignores the Wear OS exception', () => {
    expect(parseAndroidTargetRequirements(ANDROID_TEXT)).toEqual([
      { effective: day('2026-08-31'), apiLevel: 36 },
    ]);
  });

  it('reads the App Store Connect Xcode and SDK requirement', () => {
    expect(parseAppleXcodeRequirements(APPLE_TEXT)).toEqual([
      { effective: day('2026-04-28'), xcodeMajor: 26, iosSdk: 26 },
    ]);
  });

  it('reads upcoming "Beginning" requirements too', () => {
    expect(
      parseAppleXcodeRequirements(
        'Beginning April 26, 2027, apps uploaded to App Store Connect must be built with Xcode 27 or later using the SDK for iOS 27.',
      ),
    ).toEqual([{ effective: day('2027-04-26'), xcodeMajor: 27, iosSdk: 27 }]);
  });

  it('reads the recommended Xcode and strips HTML', () => {
    expect(parseAppleLatestXcode(htmlToText('<p>Build and test with <a href="#">Xcode 27</a>, which</p>'))).toBe('27');
  });

  it('reads the app target API and CI Xcode from the repository', () => {
    const toolchain = readAppToolchain();

    expect(toolchain.androidTargetApi).toBeGreaterThanOrEqual(34);
    expect(toolchain.xcodeVersion).toMatch(/^\d+(\.\d+)*$/);
  });
});

describe('store toolchain evaluation', () => {
  const evaluate = (overrides: Record<string, unknown>) =>
    evaluateStoreToolchain({
      app,
      androidRequirements: parseAndroidTargetRequirements(ANDROID_TEXT),
      appleRequirements: parseAppleXcodeRequirements(APPLE_TEXT),
      latestXcode: '27',
      today: day('2026-09-27'),
      ...overrides,
    });

  it('passes when the app meets the requirements in force', () => {
    const { checks, notes } = evaluate({});

    expect(checks.map((check: { status: string }) => check.status)).toEqual(['passed', 'passed']);
    expect(notes).toEqual([
      'Apple recommends building with Xcode 27; the iOS build uses Xcode 26.2. Not required yet.',
    ]);
  });

  it('fails when the app is below a requirement already in force', () => {
    const { checks } = evaluate({ app: { ...app, androidTargetApi: 35 } });

    expect(checks[0].status).toBe('failed');
    expect(checks[0].detail).toContain('target API level 36');
  });

  it('fails early for a requirement starting within the lead window', () => {
    const { checks } = evaluate({
      appleRequirements: [
        ...parseAppleXcodeRequirements(APPLE_TEXT),
        { effective: day('2026-12-01'), xcodeMajor: 27, iosSdk: 27 },
      ],
    });

    expect(checks[1].status).toBe('failed');
    expect(checks[1].detail).toContain('A new requirement starts 2026-12-01');
  });

  it('ignores a requirement further out than the lead window', () => {
    const { checks } = evaluate({
      appleRequirements: [
        ...parseAppleXcodeRequirements(APPLE_TEXT),
        { effective: day('2027-06-01'), xcodeMajor: 27, iosSdk: 27 },
      ],
    });

    expect(checks[1].status).toBe('passed');
  });

  it('fails instead of passing when a page can no longer be read', () => {
    const { checks } = evaluate({ androidRequirements: [] });

    expect(checks[0].status).toBe('failed');
    expect(checks[0].detail).toContain('check it by hand');
  });
});
