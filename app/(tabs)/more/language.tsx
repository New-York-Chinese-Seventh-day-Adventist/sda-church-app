import { MenuCard } from "@/components/MenuCard";
import { LanguageContext } from "@/constants/Contexts";
import { DESIGN_TOKENS } from "@/constants/Layout";
import { NavigationStyles } from "@/styles/NavigationStyles";
import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext } from "react";
import { Platform, ScrollView } from "react-native";
import { List, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LanguageScreen() {
  const { language, setLanguage } = useContext(LanguageContext);
  const { backTo } = useLocalSearchParams();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const allLabels = {
    en: { title: "Language", select: "Select Language" },
    zh: { title: "語言", select: "選擇語言" },
    "zh-cn": { title: "语言", select: "选择语言" },
    es: { title: "Idioma", select: "Seleccionar idioma" },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  return (
    <>
      <Stack.Screen options={{ title: labels.title, backTo } as any} />
      <ScrollView
        style={NavigationStyles.container}
        contentContainerStyle={[
          NavigationStyles.contentContainer,
          { paddingTop: headerHeight },
        ]}
      >
        <List.Section>
          <List.Subheader
            style={[
              NavigationStyles.subheader,
              { color: theme.colors.onBackground },
            ]}
          >
            {labels.select}
          </List.Subheader>
          <MenuCard
            title="English"
            icon="translate"
            onPress={() => setLanguage("en")}
            rightIcon={language === "en" ? "radiobox-marked" : "radiobox-blank"}
          />
          <MenuCard
            title="繁體中文 (Traditional Chinese)"
            icon="translate"
            onPress={() => setLanguage("zh")}
            rightIcon={language === "zh" ? "radiobox-marked" : "radiobox-blank"}
          />
          <MenuCard
            title="简体中文 (Simplified Chinese)"
            icon="translate"
            onPress={() => setLanguage("zh-cn")}
            rightIcon={
              language === "zh-cn" ? "radiobox-marked" : "radiobox-blank"
            }
          />
          <MenuCard
            title="Español (Spanish)"
            icon="translate"
            onPress={() => setLanguage("es")}
            rightIcon={language === "es" ? "radiobox-marked" : "radiobox-blank"}
          />
        </List.Section>

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </ScrollView>
    </>
  );
}
