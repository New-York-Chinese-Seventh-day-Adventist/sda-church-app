export const PWA_INSTALL_STATUSES = [
  'not-applicable',
  'unavailable',
  'prompt-available',
  'accepted',
  'dismissed',
  'error',
  'standalone',
] as const;

export type PwaInstallStatus = (typeof PWA_INSTALL_STATUSES)[number];

export const PWA_INSTALL_PLATFORMS = [
  'ios-safari',
  'android-chrome',
  'android-edge',
  'android-firefox',
  'android-other',
  'mac-safari',
  'desktop-chrome',
  'desktop-edge',
  'desktop-chromium',
  'firefox-windows',
  'firefox-other',
  'generic',
] as const;

export type PwaInstallPlatform = (typeof PWA_INSTALL_PLATFORMS)[number];

/**
 * The small, serializable part of the browser environment used for install
 * guidance. Keeping this separate from navigator/window makes detection
 * deterministic in both Node tests and browsers.
 */
export interface BrowserSnapshot {
  userAgent: string;
  brands?: readonly { brand: string }[];
  platform?: string;
  maxTouchPoints?: number;
  /** Safari's non-standard navigator.standalone flag. */
  standalone?: boolean;
  /** Result of matchMedia('(display-mode: standalone)').matches. */
  displayModeStandalone?: boolean;
  /** The current manifest deliberately launches the installed PWA fullscreen. */
  displayModeFullscreen?: boolean;
}

const includesAny = (value: string, markers: readonly string[]) =>
  markers.some((marker) => value.includes(marker));

/** Returns a conservative guidance family without claiming feature support. */
export const detectPwaInstallPlatform = (
  snapshot: BrowserSnapshot,
): PwaInstallPlatform => {
  const userAgent = snapshot.userAgent || '';
  const platform = snapshot.platform || '';
  const browserBrands = snapshot.brands?.map(({ brand }) => brand) ?? [];
  const hasGoogleChromeBrand = browserBrands.includes('Google Chrome');
  const hasAlternateChromiumBrand = browserBrands.some((brand) =>
    includesAny(brand, ['Brave', 'DuckDuckGo', 'Microsoft Edge', 'Opera', 'Vivaldi']),
  );
  const isIpadDesktopMode =
    platform === 'MacIntel' && (snapshot.maxTouchPoints || 0) > 1;
  const isIos =
    includesAny(userAgent, ['iPhone', 'iPad', 'iPod']) || isIpadDesktopMode;
  const isSafari =
    userAgent.includes('Safari') &&
    !includesAny(userAgent, [
      'Chrome',
      'Chromium',
      'CriOS',
      'Edg',
      'FxiOS',
      'OPR',
      'OPT/',
    ]);

  if (isIos) {
    return isSafari ? 'ios-safari' : 'generic';
  }

  const isAndroid = userAgent.includes('Android');
  if (isAndroid) {
    if (includesAny(userAgent, ['EdgA/', 'EdgiOS/'])) {
      return 'android-edge';
    }
    if (includesAny(userAgent, ['Firefox/', 'Fennec/', 'FxiOS/'])) {
      return 'android-firefox';
    }
    const isAlternateAndroidBrowser = includesAny(userAgent, [
      'SamsungBrowser/',
      'OPR/',
      'Opera',
      'DuckDuckGo/',
      'HuaweiBrowser/',
      'UCBrowser/',
      '; wv)',
    ]) || hasAlternateChromiumBrand;
    if (
      includesAny(userAgent, ['Chrome/', 'CriOS/']) &&
      !isAlternateAndroidBrowser &&
      (browserBrands.length === 0 || hasGoogleChromeBrand)
    ) {
      return 'android-chrome';
    }
    return 'android-other';
  }

  const isMac = userAgent.includes('Macintosh') || platform.startsWith('Mac');
  if (isMac && isSafari) {
    return 'mac-safari';
  }

  const isFirefox = includesAny(userAgent, ['Firefox/', 'FxiOS/']);
  if (isFirefox) {
    return userAgent.includes('Windows')
      ? 'firefox-windows'
      : 'firefox-other';
  }

  if (includesAny(userAgent, ['Edg/', 'Edge/'])) {
    return 'desktop-edge';
  }
  const isAlternateDesktopChromium =
    hasAlternateChromiumBrand ||
    includesAny(userAgent, [
      'OPR/',
      'Opera',
      'Vivaldi/',
      'YaBrowser/',
      'Brave/',
      'DuckDuckGo/',
    ]);
  if (userAgent.includes('Chromium/') || isAlternateDesktopChromium) {
    return 'desktop-chromium';
  }
  if (includesAny(userAgent, ['Chrome/', 'CriOS/'])) {
    return browserBrands.length === 0 || hasGoogleChromeBrand
      ? 'desktop-chrome'
      : 'desktop-chromium';
  }

  return 'generic';
};

export const isStandalonePwa = (snapshot: BrowserSnapshot) =>
  snapshot.standalone === true ||
  snapshot.displayModeStandalone === true ||
  snapshot.displayModeFullscreen === true;

export const getInitialPwaInstallStatus = ({
  isWeb,
  snapshot,
}: {
  isWeb: boolean;
  snapshot: BrowserSnapshot;
}): PwaInstallStatus => {
  if (!isWeb) return 'not-applicable';
  return isStandalonePwa(snapshot) ? 'standalone' : 'unavailable';
};

/**
 * The first-run install explanation stays ahead of setup only when the
 * browser has a native prompt, or when iOS Safari needs its manual steps.
 */
export const isFirstRunInstallPromptEligible = ({
  platform,
  status,
}: {
  platform: PwaInstallPlatform;
  status: PwaInstallStatus;
}) =>
  status === 'prompt-available' ||
  (platform === 'ios-safari' && status !== 'standalone');

export interface BeforeInstallPromptChoice {
  outcome: 'accepted' | 'dismissed';
  platform?: string;
}

/** Browser event intentionally omitted from lib.dom by some TypeScript releases. */
export interface BeforeInstallPromptEvent {
  readonly platforms?: readonly string[];
  readonly userChoice: Promise<BeforeInstallPromptChoice>;
  preventDefault(): void;
  prompt(): Promise<void>;
}

export type PwaInstallRequestResult =
  | { status: 'unavailable' }
  | { status: 'accepted' }
  | { status: 'dismissed' }
  | { status: 'error'; error: unknown };

/**
 * Requests the deferred browser prompt. "accepted" records the user's choice;
 * only a later appinstalled or installed display-mode signal may mark the app
 * installed. This app's manifest uses fullscreen, which is an installed mode.
 */
export const requestPwaInstall = async (
  event: BeforeInstallPromptEvent | null,
): Promise<PwaInstallRequestResult> => {
  if (!event) return { status: 'unavailable' };

  try {
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === 'accepted') return { status: 'accepted' };
    if (choice.outcome === 'dismissed') return { status: 'dismissed' };
    return {
      status: 'error',
      error: new Error('The browser returned an unknown install outcome.'),
    };
  } catch (error) {
    return { status: 'error', error };
  }
};
