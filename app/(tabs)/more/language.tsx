import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Divider, List, RadioButton } from "react-native-paper";
import { LanguageContext } from "../../_layout"; // Corrected path to root _layout

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
          <List.Item
            title="English"
            onPress={() => setLanguage("en")}
            right={() => (
              <RadioButton
                value="en"
                status={language === "en" ? "checked" : "unchecked"}
                onPress={() => setLanguage("en")}
              />
            )}
          />
          <Divider />
          <List.Item
            title="繁體中文 (Traditional Chinese)"
            onPress={() => setLanguage("zh")}
            right={() => (
              <RadioButton
                value="zh"
                status={language === "zh" ? "checked" : "unchecked"}
                onPress={() => setLanguage("zh")}
              />
            )}
          />
          <Divider />
          <List.Item
            title="简体中文 (Simplified Chinese)"
            onPress={() => setLanguage("zh-cn")}
            right={() => (
              <RadioButton
                value="zh-cn"
                status={language === "zh-cn" ? "checked" : "unchecked"}
                onPress={() => setLanguage("zh-cn")}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Español (Spanish)"
            onPress={() => setLanguage("es")}
            right={() => (
              <RadioButton
                value="es"
                status={language === "es" ? "checked" : "unchecked"}
                onPress={() => setLanguage("es")}
              />
            )}
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
    paddingTop: 20,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
});
