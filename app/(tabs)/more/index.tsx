import { LanguageContext, ThemeContext } from "@/constants/Contexts";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  Divider,
  List,
  Switch,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import packageJson from "../../../package.json";
import { openOnlineGiving } from "../../../utils/externalLinks";
import { UpdateContext } from "../../_layout";

export default function MoreScreen() {
  const { language } = useContext(LanguageContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { onManualCheck, updateStatus } = useContext(UpdateContext);
  const theme = useTheme();
  const { highlight } = useLocalSearchParams();
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const allLabels = {
    en: {
      info: "Information",
      about: "About Us",
      contact: "Connect with Us",
      give: "Give",
      settings: "Settings",
      language: "Language",
      darkMode: "Dark Mode",
      update: "Check for Updates",
    },
    zh: {
      info: "教會資訊",
      about: "關於我們",
      contact: "聯繫我們",
      give: "捐獻",
      settings: "設定",
      language: "語言設定",
      darkMode: "深色模式",
      update: "檢查更新",
    },
    "zh-cn": {
      info: "教会信息",
      about: "关于我们",
      contact: "联系我们",
      give: "捐献",
      settings: "设置",
      language: "语言设置",
      darkMode: "深色模式",
      update: "检查更新",
    },
    es: {
      info: "Información",
      about: "Sobre nosotros",
      contact: "Conéctate con Nosotros",
      give: "Dar",
      settings: "Ajustes",
      language: "Idioma",
      darkMode: "Modo oscuro",
      update: "Buscar actualizaciones",
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  useEffect(() => {
    if (highlight) {
      setActiveHighlight(highlight as string);

      // Instant Highlight flicker
      // Based on platform motion standards:
      // - Material Design 3: Uses 'Standard' tokens for small-area transitions (300ms).
      // https://m3.material.io/styles/motion/easing-and-duration/applying-easing-and-duration
      // - Apple HIG (Responsiveness & Motion) is vague, but underlying libraries typically use 300-500ms
      // https://developer.apple.com/design/human-interface-guidelines/motion#Best-practices
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setActiveHighlight(null);
        router.setParams({ highlight: undefined });
      });
    }
  }, [highlight]);

  const getHighlightStyle = (key: string) => {
    if (activeHighlight !== key) return {};
    return {
      backgroundColor: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["transparent", theme.colors.primaryContainer],
      }),
    };
  };

  return (
    <>
      <Stack.Screen options={{ title: labels.info }} />
      <ScrollView style={styles.container}>
        <List.Section>
          <List.Subheader>{labels.info}</List.Subheader>
          <List.Item
            title={labels.about}
            left={(p) => <List.Icon {...p} icon="information" />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() => router.push("/more/about" as any)}
          />
          <List.Item
            title={labels.contact}
            left={(p) => <List.Icon {...p} icon="email" />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() => router.push("/more/contact")}
          />
          <Animated.View style={getHighlightStyle("give")}>
            <List.Item
              title={labels.give}
              left={(p) => <List.Icon {...p} icon="gift" />}
              right={(p) => <List.Icon {...p} icon="open-in-new" />}
              onPress={openOnlineGiving}
            />
          </Animated.View>
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>{labels.settings}</List.Subheader>
          <List.Item
            title={labels.language}
            left={(p) => <List.Icon {...p} icon="translate" />}
            right={(p) => <List.Icon {...p} icon="chevron-right" />}
            onPress={() => router.push("/more/language")}
          />
          <Animated.View style={getHighlightStyle("darkMode")}>
            <List.Item
              title={labels.darkMode}
              left={(p) => <List.Icon {...p} icon="theme-light-dark" />}
              right={() => (
                <Switch value={isDark} onValueChange={toggleTheme} />
              )}
            />
          </Animated.View>
        </List.Section>

        <View style={styles.footer}>
          <TouchableRipple
            onPress={Platform.OS === "web" ? () => onManualCheck() : undefined}
            disabled={updateStatus !== "idle"}
            style={styles.versionRipple}
          >
            <Text variant="labelSmall" style={styles.versionText}>
              Version {packageJson.version}
            </Text>
          </TouchableRipple>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: "center",
  },
  versionRipple: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  versionText: {
    opacity: 0.5,
  },
});
