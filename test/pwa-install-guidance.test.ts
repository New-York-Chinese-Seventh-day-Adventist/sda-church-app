import {
  detectPwaInstallPlatform,
  getInitialPwaInstallStatus,
  isFirstRunInstallPromptEligible,
  isStandalonePwa,
  requestPwaInstall,
  type BeforeInstallPromptEvent,
  type BrowserSnapshot,
} from '@/services/PwaInstallGuidance';

describe('PWA installation guidance behavior', () => {
  it.each([
    [
      'iOS Safari',
      {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
      },
      'ios-safari',
    ],
    [
      'iPadOS Safari in desktop mode',
      {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      },
      'ios-safari',
    ],
    [
      'Chrome on Android',
      {
        userAgent:
          'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36',
      },
      'android-chrome',
    ],
    [
      'Edge on Android',
      {
        userAgent:
          'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36 EdgA/130.0.0.0',
      },
      'android-edge',
    ],
    [
      'Firefox on Android',
      {
        userAgent:
          'Mozilla/5.0 (Android 15; Mobile; rv:132.0) Gecko/132.0 Firefox/132.0',
      },
      'android-firefox',
    ],
    [
      'another Android browser',
      {
        userAgent:
          'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36 SamsungBrowser/27.0',
      },
      'android-other',
    ],
    [
      'Safari on Mac',
      {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15',
        platform: 'MacIntel',
      },
      'mac-safari',
    ],
    [
      'Chrome on desktop',
      {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
      },
      'desktop-chrome',
    ],
    [
      'Edge on desktop',
      {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
      },
      'desktop-edge',
    ],
    [
      'Chromium on desktop',
      {
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chromium/130.0.0.0 Safari/537.36',
      },
      'desktop-chromium',
    ],
    [
      'Opera on desktop',
      {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 OPR/115.0.0.0',
      },
      'desktop-chromium',
    ],
    [
      'Firefox on Windows',
      {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
      },
      'firefox-windows',
    ],
    [
      'Firefox on another desktop',
      {
        userAgent:
          'Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0',
      },
      'firefox-other',
    ],
    ['an unknown browser', { userAgent: 'ExampleBrowser/1.0' }, 'generic'],
  ] as const)('detects %s conservatively', (_name, snapshot, expected) => {
    expect(detectPwaInstallPlatform(snapshot)).toBe(expected);
  });

  it('does not misidentify non-Safari iOS browsers as iOS Safari', () => {
    expect(
      detectPwaInstallPlatform({
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/130.0.0.0 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
      }),
    ).toBe('generic');
  });

  it('uses browser brand metadata instead of calling alternate Chromium browsers Chrome', () => {
    expect(
      detectPwaInstallPlatform({
        brands: [{ brand: 'Chromium' }, { brand: 'Brave' }],
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
      }),
    ).toBe('desktop-chromium');
    expect(
      detectPwaInstallPlatform({
        brands: [{ brand: 'Chromium' }, { brand: 'Google Chrome' }],
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',
      }),
    ).toBe('desktop-chrome');
  });

  it('derives standalone state from either standard or iOS browser signals', () => {
    expect(isStandalonePwa({ userAgent: '', standalone: true })).toBe(true);
    expect(
      isStandalonePwa({ userAgent: '', displayModeStandalone: true }),
    ).toBe(true);
    expect(
      isStandalonePwa({ userAgent: '', displayModeFullscreen: true }),
    ).toBe(true);
    expect(isStandalonePwa({ userAgent: '' })).toBe(false);

    expect(
      getInitialPwaInstallStatus({
        isWeb: true,
        snapshot: { userAgent: '', displayModeStandalone: true },
      }),
    ).toBe('standalone');
    expect(
      getInitialPwaInstallStatus({
        isWeb: true,
        snapshot: { userAgent: '' },
      }),
    ).toBe('unavailable');
    expect(
      getInitialPwaInstallStatus({
        isWeb: false,
        snapshot: { userAgent: '', displayModeStandalone: true },
      }),
    ).toBe('not-applicable');
  });

  it('keeps eligible install guidance ahead of first-run setup', () => {
    expect(
      isFirstRunInstallPromptEligible({
        platform: 'ios-safari',
        status: 'unavailable',
      }),
    ).toBe(true);
    expect(
      isFirstRunInstallPromptEligible({
        platform: 'desktop-chrome',
        status: 'prompt-available',
      }),
    ).toBe(true);
    expect(
      isFirstRunInstallPromptEligible({
        platform: 'generic',
        status: 'unavailable',
      }),
    ).toBe(false);
    expect(
      isFirstRunInstallPromptEligible({
        platform: 'ios-safari',
        status: 'standalone',
      }),
    ).toBe(false);
  });

  const createPromptEvent = (
    outcome: 'accepted' | 'dismissed',
  ): BeforeInstallPromptEvent => ({
    preventDefault: jest.fn(),
    prompt: jest.fn(async () => undefined),
    userChoice: Promise.resolve({ outcome }),
  });

  it('distinguishes an accepted request from confirmed installation', async () => {
    const event = createPromptEvent('accepted');

    await expect(requestPwaInstall(event)).resolves.toEqual({
      status: 'accepted',
    });
    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(isStandalonePwa({ userAgent: '' })).toBe(false);
  });

  it('reports browser dismissal without treating it as an error', async () => {
    await expect(
      requestPwaInstall(createPromptEvent('dismissed')),
    ).resolves.toEqual({ status: 'dismissed' });
  });

  it('reports missing and failed prompts as distinct outcomes', async () => {
    await expect(requestPwaInstall(null)).resolves.toEqual({
      status: 'unavailable',
    });

    const promptError = new Error('prompt failed');
    const event: BeforeInstallPromptEvent = {
      preventDefault: jest.fn(),
      prompt: jest.fn(async () => {
        throw promptError;
      }),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    };

    await expect(requestPwaInstall(event)).resolves.toEqual({
      status: 'error',
      error: promptError,
    });
  });

  it('treats an unexpected browser choice as an error', async () => {
    const event = {
      preventDefault: jest.fn(),
      prompt: jest.fn(async () => undefined),
      userChoice: Promise.resolve({ outcome: 'unexpected' }),
    } as unknown as BeforeInstallPromptEvent;

    const result = await requestPwaInstall(event);
    expect(result.status).toBe('error');
  });
});
