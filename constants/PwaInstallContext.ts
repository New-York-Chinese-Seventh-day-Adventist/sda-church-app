import { createContext, useContext } from 'react';

export interface BeforeInstallPromptEventLike extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export type PwaInstallRequestResult =
  | 'accepted'
  | 'dismissed'
  | 'unavailable'
  | 'error';

export type PwaInstallStatus =
  | 'accepted'
  | 'dismissed'
  | 'not-applicable'
  | 'prompt-available'
  | 'standalone'
  | 'unavailable';

interface PwaInstallContextValue {
  requestInstall: () => Promise<PwaInstallRequestResult>;
  status: PwaInstallStatus;
}

export const PwaInstallContext = createContext<PwaInstallContextValue>({
  requestInstall: async () => 'unavailable',
  status: 'not-applicable',
});

export const usePwaInstall = () => useContext(PwaInstallContext);
