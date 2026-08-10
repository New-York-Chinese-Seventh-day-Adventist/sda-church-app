import { MenuCard } from '@/components/MenuCard';
import { PwaInstallDialog } from '@/components/PwaInstallDialog';
import { LanguageContext } from '@/constants/LanguageContext';
import { usePwaInstall } from '@/constants/PwaInstallContext';
import { getPwaInstallCopy } from '@/constants/PwaInstallCopy';
import { useAppTheme } from '@/constants/Themes';
import { useContext, useState } from 'react';
import { Platform } from 'react-native';

export interface PwaInstallMenuCardProps {
  /** Injectable platform boundary for deterministic route-level tests. */
  isWeb?: boolean;
}

export const PwaInstallMenuCard = ({
  isWeb = Platform.OS === 'web',
}: PwaInstallMenuCardProps) => {
  const { language } = useContext(LanguageContext);
  const { platform, requestInstall, status } = usePwaInstall();
  const theme = useAppTheme();
  const [showGuide, setShowGuide] = useState(false);
  const copy = getPwaInstallCopy(language);

  if (!isWeb) return null;

  return (
    <>
      <MenuCard
        title={copy.menu.title}
        description={copy.menu.description}
        icon="download"
        iconColor={theme.colors.secondary}
        onPress={() => setShowGuide(true)}
        reflowAtLargeText
      />
      <PwaInstallDialog
        visible={showGuide}
        status={status}
        platform={platform}
        onDismiss={() => setShowGuide(false)}
        onInstall={async () => {
          await requestInstall();
        }}
      />
    </>
  );
};
