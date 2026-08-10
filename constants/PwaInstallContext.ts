import type {
  PwaInstallPlatform,
  PwaInstallStatus,
} from '@/services/PwaInstallGuidance';
import { createContext, useContext } from 'react';

export interface PwaInstallContextValue {
  platform: PwaInstallPlatform;
  requestInstall: () => Promise<PwaInstallStatus>;
  status: PwaInstallStatus;
}

export const PwaInstallContext = createContext<PwaInstallContextValue>({
  platform: 'generic',
  requestInstall: async () => 'unavailable',
  status: 'not-applicable',
});

export const usePwaInstall = () => useContext(PwaInstallContext);
