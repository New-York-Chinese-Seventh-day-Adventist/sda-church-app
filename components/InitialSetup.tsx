import {
  isTextScale,
  TEXT_SCALE_OPTIONS,
  type TextScale,
} from '@/constants/AppPreferences';
import {
  LanguageContext,
  SupportedLanguage,
} from "@/constants/LanguageContext";
import { useTextSize } from '@/constants/TextSizeContext';
import { ThemeContext, useAppTheme } from "@/constants/Themes";
import { useContext, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Modal,
  Portal,
  SegmentedButtons,
  Text,
} from "react-native-paper";

interface InitialSetupProps {
  onComplete: () => void;
}

export const InitialSetup = ({ onComplete }: InitialSetupProps) => {
  const { language, setLanguage } = useContext(LanguageContext);
  const { toggleTheme } = useContext(ThemeContext);
  const { setTextScale, textScale } = useTextSize();
  const theme = useAppTheme();
  const [isSavingTextScale, setIsSavingTextScale] = useState(false);
  const [failedTextScale, setFailedTextScale] = useState<TextScale | null>(null);
  const textScaleWritePendingRef = useRef(false);
  const failedTextScaleRef = useRef<TextScale | null>(null);

  const allLabels = {
    en: {
      title: "Welcome",
      sub: "Let's personalize your experience",
      lang: "Language",
      theme: "Appearance",
      dark: "Dark",
      light: "Light",
      start: "Get Started",
    },
    zh: {
      title: "歡迎",
      sub: "自定義您的體驗",
      lang: "語言設定",
      theme: "外觀模式",
      dark: "深色",
      light: "淺色",
      start: "開始使用",
    },
    "zh-cn": {
      title: "欢迎",
      sub: "自定义您的体验",
      lang: "语言设置",
      theme: "外观模式",
      dark: "深色",
      light: "浅色",
      start: "开始使用",
    },
    es: {
      title: "Bienvenido",
      sub: "Personalicemos tu experiencia",
      lang: "Idioma",
      theme: "Apariencia",
      dark: "Oscuro",
      light: "Claro",
      start: "Comenzar",
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;
  const englishOnly = language !== 'en';

  const persistTextScale = async (nextScale: TextScale) => {
    if (textScaleWritePendingRef.current) return;

    textScaleWritePendingRef.current = true;
    setIsSavingTextScale(true);
    try {
      await setTextScale(nextScale);
      failedTextScaleRef.current = null;
      setFailedTextScale(null);
    } catch {
      failedTextScaleRef.current = nextScale;
      setFailedTextScale(nextScale);
    } finally {
      textScaleWritePendingRef.current = false;
      setIsSavingTextScale(false);
    }
  };

  const completeSetup = () => {
    if (
      textScaleWritePendingRef.current ||
      failedTextScaleRef.current !== null
    ) {
      return;
    }
    onComplete();
  };

  return (
    <Portal>
      <Modal
        visible={true}
        dismissable={false}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text variant="headlineMedium" style={styles.title}>
            {labels.title}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {labels.sub}
          </Text>

          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.label}>
              {labels.lang}
            </Text>
            <SegmentedButtons
              value={language}
              onValueChange={(value) => {
                if (!textScaleWritePendingRef.current) {
                  setLanguage(value as SupportedLanguage);
                }
              }}
              buttons={[
                { value: "en", label: "EN" },
                { value: "zh", label: "繁體" },
                { value: "zh-cn", label: "简体" },
                { value: "es", label: "ES" },
              ].map((button) => ({ ...button, disabled: isSavingTextScale }))}
            />
          </View>

          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.label}>
              {labels.theme}
            </Text>
            <SegmentedButtons
              value={theme.dark ? "dark" : "light"}
              onValueChange={(value) => {
                if (!textScaleWritePendingRef.current) toggleTheme(value);
              }}
              buttons={[
                { value: "light", label: labels.light, icon: "weather-sunny" },
                { value: "dark", label: labels.dark, icon: "weather-night" },
              ].map((button) => ({ ...button, disabled: isSavingTextScale }))}
            />
          </View>

          <View style={styles.section}>
            <Text variant="labelLarge" style={styles.label}>
              {`Text size${englishOnly ? ' (English)' : ''}`}
            </Text>
            {englishOnly && (
              <Text variant="labelSmall" style={styles.englishDisclosure}>
                This accessibility setting is currently described in English.
              </Text>
            )}
            <SegmentedButtons
              value={String(textScale)}
              onValueChange={(value) => {
                const nextScale = Number(value);
                if (isTextScale(nextScale)) void persistTextScale(nextScale);
              }}
              buttons={TEXT_SCALE_OPTIONS.map((scale) => ({
                accessibilityLabel: `${Math.round(scale * 100)} percent text size`,
                disabled: isSavingTextScale,
                label: `${Math.round(scale * 100)}%`,
                value: String(scale),
              }))}
            />
            {isSavingTextScale && (
              <Text
                accessibilityLiveRegion="polite"
                style={styles.textScaleStatus}
                variant="bodyMedium"
              >
                Saving text size…
              </Text>
            )}
            {failedTextScale !== null && !isSavingTextScale && (
              <View style={styles.textScaleError}>
                <Text
                  accessibilityLiveRegion="assertive"
                  role="alert"
                  style={{ color: theme.colors.error }}
                  variant="bodyMedium"
                >
                  {`${Math.round(failedTextScale * 100)}% text size could not be saved. Retry before continuing.`}
                </Text>
                <Button
                  accessibilityLabel={`Retry saving ${Math.round(failedTextScale * 100)} percent text size`}
                  compact
                  mode="outlined"
                  onPress={() => void persistTextScale(failedTextScale)}
                  style={styles.retryButton}
                >
                  Retry
                </Button>
              </View>
            )}
          </View>

          <Button
            disabled={isSavingTextScale || failedTextScale !== null}
            mode="contained"
            onPress={completeSetup}
            style={styles.button}
          >
            {labels.start}
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    borderRadius: 16,
    maxWidth: 500,
    maxHeight: '90%',
    alignSelf: "center",
    width: "90%",
  },
  modalContent: {
    padding: 24,
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 12,
    fontWeight: "600",
  },
  englishDisclosure: {
    marginBottom: 12,
    opacity: 0.75,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  textScaleError: {
    marginTop: 12,
  },
  textScaleStatus: {
    marginTop: 12,
    opacity: 0.75,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
});
