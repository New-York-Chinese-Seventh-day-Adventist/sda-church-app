import { WrappingButton } from '@/components/WrappingButton';
import { LanguageContext } from '@/constants/LanguageContext';
import { useAppTheme } from '@/constants/Themes';
import { useContext } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface InstallPromptProps {
  onDismiss: () => void;
  onInstall: () => Promise<void>;
}

const allLabels = {
  en: {
    title: 'Install the app',
    sub: 'Add NY Chinese SDA to your device for quick access.',
    install: 'Install App',
    later: 'Not now',
    dialogA11y: 'Install app prompt',
    installA11y: 'Install the church app',
    laterA11y: 'Continue without installing',
  },
  zh: {
    title: '安裝應用程式',
    sub: '將紐約華人基督復臨安息日會新增到您的裝置，以便快速開啟。',
    install: '安裝應用程式',
    later: '暫時不要',
    dialogA11y: '安裝應用程式提示',
    installA11y: '安裝教會應用程式',
    laterA11y: '暫時不安裝並繼續',
  },
  'zh-cn': {
    title: '安装应用',
    sub: '将纽约华人基督复临安息日会添加到您的设备，以便快速打开。',
    install: '安装应用',
    later: '暂时不要',
    dialogA11y: '安装应用提示',
    installA11y: '安装教会应用',
    laterA11y: '暂不安装并继续',
  },
  es: {
    title: 'Instalar la aplicación',
    sub: 'Añade NY Chinese SDA a tu dispositivo para acceder rápidamente.',
    install: 'Instalar aplicación',
    later: 'Ahora no',
    dialogA11y: 'Solicitud para instalar la aplicación',
    installA11y: 'Instalar la aplicación de la iglesia',
    laterA11y: 'Continuar sin instalar',
  },
};

export const InstallPrompt = ({ onDismiss, onInstall }: InstallPromptProps) => {
  const { language } = useContext(LanguageContext);
  const theme = useAppTheme();
  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;
  const containedTextColor = theme.dark
    ? theme.colors.onPrimary
    : theme.colors.onBackground;
  const outlinedTextColor = theme.dark
    ? theme.colors.primary
    : theme.colors.onBackground;

  return (
    <Modal
      accessibilityLabel={labels.dialogA11y}
      accessibilityViewIsModal
      animationType="fade"
      onRequestClose={onDismiss}
      presentationStyle="overFullScreen"
      transparent
      visible
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
          style={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            <Text
              accessibilityRole="header"
              variant="headlineSmall"
              style={styles.title}
            >
              {labels.title}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {labels.sub}
            </Text>
            <View style={styles.actions}>
              <WrappingButton
                accessibilityLabel={labels.installA11y}
                buttonColor={theme.colors.primary}
                icon="download"
                mode="contained"
                onPress={() => void onInstall()}
                style={styles.action}
                textColor={containedTextColor}
              >
                {labels.install}
              </WrappingButton>
              <WrappingButton
                accessibilityLabel={labels.laterA11y}
                mode="outlined"
                onPress={onDismiss}
                style={[styles.action, { borderColor: outlinedTextColor }]}
                textColor={outlinedTextColor}
              >
                {labels.later}
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
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modal: {
    borderRadius: 16,
    maxHeight: '90%',
    maxWidth: 500,
    overflow: 'hidden',
    width: '92%',
  },
  overlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  scrollContent: {
    padding: 24,
  },
  scrollView: {
    flexShrink: 1,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
});
