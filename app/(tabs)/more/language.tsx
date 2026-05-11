import { MenuCard } from "@/components/MenuCard";
import { LanguageContext } from "@/constants/Contexts";
import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { List } from "react-native-paper";

export default function LanguageScreen() {
  const { language, setLanguage } = useContext(LanguageContext);
  const { backTo } = useLocalSearchParams();

  const allLabels = {
    en: { title: "Language" },
    zh: { title: "語言" },
    "zh-cn": { title: "语言" },
    es: { title: "Idioma" },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  return (
    <>
      <Stack.Screen options={{ title: labels.title, backTo } as any} />
      <View style={styles.container}>
        <List.Section>
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});
