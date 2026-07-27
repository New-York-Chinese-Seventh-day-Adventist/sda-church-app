import { LanguageContext } from '@/constants/LanguageContext';
import { usePwaInstall } from '@/constants/PwaInstallContext';
import { resolvePwaInstallGuidance } from '@/services/PwaInstallGuidance';
import { useContext, useState } from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

interface PwaInstallDialogProps {
  onDismiss: () => void;
  visible: boolean;
}

const statusCopy = {
  accepted:
    'The browser accepted the request. Follow any remaining browser or system steps. This app does not track installation completion.',
  dismissed:
    'The browser install request was dismissed. You can close this guide and try again later if the browser offers a new request.',
  'not-applicable': 'Installation guidance is available only in the web app.',
  'prompt-available':
    'Your browser has made an install request available. Installation is handled by the browser and operating system.',
  standalone: 'This app is already running as an installed app. No install action is needed.',
  unavailable:
    'This browser did not expose an in-app install prompt. Use the manual steps below only if the named action is offered.',
} as const;

export const PwaInstallDialog = ({ onDismiss, visible }: PwaInstallDialogProps) => {
  const { language } = useContext(LanguageContext);
  const { requestInstall, status } = usePwaInstall();
  const [requesting, setRequesting] = useState(false);
  const englishOnly = language !== 'en';
  const webNavigator = typeof navigator === 'undefined' ? null : navigator;
  const navigatorWithBrands = webNavigator as
    | (Navigator & { userAgentData?: { brands?: { brand: string }[] } })
    | null;
  const manualGuidance = resolvePwaInstallGuidance(webNavigator?.userAgent ?? '', {
    brands: navigatorWithBrands?.userAgentData?.brands,
    maxTouchPoints: webNavigator?.maxTouchPoints,
    platform: webNavigator?.platform,
  });

  const handleInstall = async () => {
    setRequesting(true);
    try {
      await requestInstall();
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{`Install app${englishOnly ? ' (English)' : ''}`}</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
          >
            {englishOnly ? (
              <Text variant="labelMedium">
                This installation guidance is currently available in English.
              </Text>
            ) : null}
            <Text variant="bodyMedium" style={{ marginTop: englishOnly ? 12 : 0 }}>
              {statusCopy[status]}
            </Text>
            {status !== 'not-applicable' && status !== 'standalone' ? (
              <>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  {`Manual steps for ${manualGuidance.platform}`}
                </Text>
                {manualGuidance.steps.map((step, index) => (
                  <Text key={step} variant="bodyMedium" style={styles.step}>
                    {`${index + 1}. ${step}`}
                  </Text>
                ))}
              </>
            ) : null}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Close</Button>
          {status === 'prompt-available' ? (
            <Button
              accessibilityLabel="Ask browser to install app"
              disabled={requesting}
              loading={requesting}
              mode="contained"
              onPress={() => void handleInstall()}
            >
              Install
            </Button>
          ) : null}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    alignSelf: 'center',
    maxHeight: '90%',
    maxWidth: 560,
    width: '90%',
  },
  scrollArea: {
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  sectionTitle: {
    marginTop: 16,
  },
  step: {
    marginTop: 8,
  },
});
