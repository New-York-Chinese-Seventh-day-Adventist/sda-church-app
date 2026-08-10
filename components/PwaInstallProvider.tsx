import { PwaInstallContext } from '@/constants/PwaInstallContext';
import {
  detectPwaInstallPlatform,
  getInitialPwaInstallStatus,
  requestPwaInstall,
  type BeforeInstallPromptEvent,
  type BrowserSnapshot,
} from '@/services/PwaInstallGuidance';
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

type PwaInstallEventListener = (event: Event) => void;

export interface PwaInstallRuntime {
  addEventListener: (
    type: 'appinstalled' | 'beforeinstallprompt',
    listener: PwaInstallEventListener,
  ) => void;
  getSnapshot: () => BrowserSnapshot;
  isWeb: boolean;
  removeEventListener: (
    type: 'appinstalled' | 'beforeinstallprompt',
    listener: PwaInstallEventListener,
  ) => void;
}

const EMPTY_BROWSER_SNAPSHOT: BrowserSnapshot = { userAgent: '' };

export const createBrowserPwaInstallRuntime = (): PwaInstallRuntime => {
  const isWeb =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined';

  if (!isWeb) {
    return {
      addEventListener: () => {},
      getSnapshot: () => EMPTY_BROWSER_SNAPSHOT,
      isWeb: false,
      removeEventListener: () => {},
    };
  }

  const pwaNavigator = navigator as Navigator & {
    standalone?: boolean;
    userAgentData?: { brands?: readonly { brand: string }[] };
  };

  return {
    addEventListener: (type, listener) => window.addEventListener(type, listener),
    getSnapshot: () => ({
      brands: pwaNavigator.userAgentData?.brands,
      displayModeFullscreen: window.matchMedia('(display-mode: fullscreen)').matches,
      displayModeStandalone: window.matchMedia('(display-mode: standalone)').matches,
      maxTouchPoints: navigator.maxTouchPoints,
      platform: navigator.platform,
      standalone: pwaNavigator.standalone,
      userAgent: navigator.userAgent,
    }),
    isWeb: true,
    removeEventListener: (type, listener) =>
      window.removeEventListener(type, listener),
  };
};

export interface PwaInstallProviderProps extends PropsWithChildren {
  /** Injectable browser boundary for deterministic behavioral tests. */
  runtime?: PwaInstallRuntime;
}

export const PwaInstallProvider = ({
  children,
  runtime,
}: PwaInstallProviderProps) => {
  const activeRuntime = useMemo(
    () => runtime ?? createBrowserPwaInstallRuntime(),
    [runtime],
  );
  const initialSnapshot = activeRuntime.getSnapshot();
  const [platform, setPlatform] = useState(() =>
    detectPwaInstallPlatform(initialSnapshot),
  );
  const [status, setStatus] = useState(() =>
    getInitialPwaInstallStatus({
      isWeb: activeRuntime.isWeb,
      snapshot: initialSnapshot,
    }),
  );
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const installed = useRef(status === 'standalone');

  useEffect(() => {
    const snapshot = activeRuntime.getSnapshot();
    setPlatform(detectPwaInstallPlatform(snapshot));
    const initialStatus = getInitialPwaInstallStatus({
      isWeb: activeRuntime.isWeb,
      snapshot,
    });
    installed.current = initialStatus === 'standalone';
    setStatus(initialStatus);

    if (!activeRuntime.isWeb) return;

    const onBeforeInstallPrompt: PwaInstallEventListener = (event) => {
      const installEvent = event as unknown as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      if (installed.current) {
        deferredPrompt.current = null;
        setStatus('standalone');
        return;
      }
      deferredPrompt.current = installEvent;
      setStatus('prompt-available');
    };
    const onAppInstalled: PwaInstallEventListener = () => {
      installed.current = true;
      deferredPrompt.current = null;
      setStatus('standalone');
    };

    activeRuntime.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    activeRuntime.addEventListener('appinstalled', onAppInstalled);

    return () => {
      activeRuntime.removeEventListener(
        'beforeinstallprompt',
        onBeforeInstallPrompt,
      );
      activeRuntime.removeEventListener('appinstalled', onAppInstalled);
    };
  }, [activeRuntime]);

  const handleInstallRequest = useCallback(async () => {
    const prompt = deferredPrompt.current;
    deferredPrompt.current = null;
    const result = await requestPwaInstall(prompt);
    // appinstalled can fire before userChoice settles. Never let the older
    // request result overwrite a definitive installed signal.
    setStatus((currentStatus) =>
      currentStatus === 'standalone' ? currentStatus : result.status,
    );
    return result.status;
  }, []);

  const value = useMemo(
    () => ({
      platform,
      requestInstall: handleInstallRequest,
      status,
    }),
    [handleInstallRequest, platform, status],
  );

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
    </PwaInstallContext.Provider>
  );
};
