import { WrappingButton } from '@/components/WrappingButton';
import { LanguageContext } from '@/constants/LanguageContext';
import { getPwaInstallCopy } from '@/constants/PwaInstallCopy';
import { useAppTheme } from '@/constants/Themes';
import type {
  PwaInstallPlatform,
  PwaInstallStatus,
} from '@/services/PwaInstallGuidance';
import { useContext, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export interface PwaInstallDialogProps {
  onDismiss: () => void;
  onInstall: () => Promise<void> | void;
  platform: PwaInstallPlatform;
  status: PwaInstallStatus;
  visible: boolean;
}

export const PwaInstallDialog = ({
  onDismiss,
  onInstall,
  platform,
  status,
  visible,
}: PwaInstallDialogProps) => {
  const { language } = useContext(LanguageContext);
  const theme = useAppTheme();
  const copy = getPwaInstallCopy(language);
  const platformCopy = copy.manualSteps[platform];
  const statusCopy = copy.status[status];
  const [requesting, setRequesting] = useState(false);
  const showManualSteps =
    status !== 'not-applicable' && status !== 'standalone';
  const containedTextColor = theme.dark
    ? theme.colors.onPrimary
    : theme.colors.onBackground;
  const outlinedTextColor = theme.dark
    ? theme.colors.primary
    : theme.colors.onBackground;

  const requestInstall = async () => {
    if (requesting) return;

    setRequesting(true);
    try {
      await onInstall();
    } catch {
      // The shared install controller reports the localized error state.
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Modal
      accessibilityLabel={copy.a11y.dialog}
      accessibilityViewIsModal
      animationType="fade"
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onPress={onDismiss}
          style={styles.backdrop}
        />
        <View
          style={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            horizontal={false}
            showsVerticalScrollIndicator
            style={styles.scrollView}
          >
            <Text
              accessibilityRole="header"
              style={styles.title}
              variant="headlineSmall"
            >
              {copy.dialog.title}
            </Text>
            <Text style={styles.description} variant="bodyMedium">
              {copy.dialog.description}
            </Text>

            <View
              style={[
                styles.statusPanel,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.outlineVariant,
                },
              ]}
            >
              <Text style={styles.statusLabel} variant="titleSmall">
                {statusCopy.label}
              </Text>
              <Text
                accessibilityLiveRegion={
                  status === 'error' ? 'assertive' : 'polite'
                }
                style={styles.statusDescription}
                variant="bodyMedium"
              >
                {statusCopy.description}
              </Text>
            </View>

            {showManualSteps ? (
              <View style={styles.manualSection}>
                <Text style={styles.sectionTitle} variant="titleMedium">
                  {copy.dialog.manualStepsHeading}
                </Text>
                <Text style={styles.platformLabel} variant="labelLarge">
                  {platformCopy.label}
                </Text>
                {platformCopy.steps.map((step, index) => (
                  <View key={`${platform}-${index}`} style={styles.stepRow}>
                    <Text style={styles.stepNumber} variant="bodyMedium">
                      {`${index + 1}.`}
                    </Text>
                    <Text style={styles.stepText} variant="bodyMedium">
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.actions}>
              {status === 'prompt-available' ? (
                <WrappingButton
                  accessibilityLabel={copy.a11y.install}
                  buttonColor={theme.colors.primary}
                  disabled={requesting}
                  icon="download"
                  mode="contained"
                  onPress={() => void requestInstall()}
                  style={styles.action}
                  textColor={containedTextColor}
                >
                  {copy.buttons.install}
                </WrappingButton>
              ) : null}
              <WrappingButton
                accessibilityLabel={copy.a11y.close}
                mode="outlined"
                onPress={onDismiss}
                style={[styles.action, { borderColor: outlinedTextColor }]}
                textColor={outlinedTextColor}
              >
                {copy.buttons.close}
              </WrappingButton>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  action: {
    alignSelf: 'stretch',
    flexBasis: 180,
    flexGrow: 1,
    minWidth: 0,
  },
  actions: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  description: {
    flexShrink: 1,
    marginTop: 8,
  },
  manualSection: {
    marginTop: 24,
  },
  modal: {
    borderRadius: 16,
    maxHeight: '90%',
    maxWidth: 560,
    overflow: 'hidden',
    width: '92%',
  },
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  platformLabel: {
    flexShrink: 1,
    fontWeight: '700',
    marginTop: 8,
  },
  scrollContent: {
    padding: 20,
  },
  scrollView: {
    flexShrink: 1,
  },
  sectionTitle: {
    flexShrink: 1,
    fontWeight: '700',
  },
  statusDescription: {
    flexShrink: 1,
    marginTop: 6,
  },
  statusLabel: {
    flexShrink: 1,
    fontWeight: '700',
  },
  statusPanel: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    padding: 16,
  },
  stepNumber: {
    flexShrink: 0,
    fontWeight: '700',
    marginRight: 8,
  },
  stepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginTop: 10,
  },
  stepText: {
    flex: 1,
    flexShrink: 1,
  },
  title: {
    flexShrink: 1,
    fontWeight: '700',
  },
});
