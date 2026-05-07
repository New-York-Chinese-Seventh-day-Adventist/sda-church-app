import { router } from "expo-router";
import React, { useContext } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Divider, List, Switch } from "react-native-paper";
import { openOnlineGiving } from "../../../utils/externalLinks";
import { LanguageContext, ThemeContext } from "../../_layout";

export default function MoreScreen() {
  const { language } = useContext(LanguageContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);

  const labels =
    {
      en: {
        info: "Church Information",
        about: "About Us",
        contact: "Connect with Us",
        community: "Community",
        give: "Give",
        settings: "Settings",
        language: "Language",
        darkMode: "Dark Mode",
      },
      zh: {
        info: "教會資訊",
        about: "關於我們",
        contact: "聯繫我們",
        community: "社區與事工",
        give: "捐獻",
        settings: "設定",
        language: "語言設定",
        darkMode: "深色模式",
      },
      "zh-cn": {
        info: "教会信息",
        about: "关于我们",
        contact: "联系我们",
        community: "社区与事工",
        give: "捐献",
        settings: "设置",
        language: "语言设置",
        darkMode: "深色模式",
      },
      es: {
        info: "Información de la iglesia",
        about: "Sobre nosotros",
        contact: "Conéctate con Nosotros",
        community: "Comunidad",
        give: "Dar",
        settings: "Ajustes",
        language: "Idioma",
        darkMode: "Modo oscuro",
      },
    }[language as "en" | "zh" | "zh-cn" | "es"] || {};

  return (
    <>
      <ScrollView style={styles.container}>
        <List.Section>
          <List.Subheader>{labels.info}</List.Subheader>
          <List.Item
            title={labels.about}
            left={(p) => <List.Icon {...p} icon="information" />}
          />
          <List.Item
            title={labels.contact}
            left={(p) => <List.Icon {...p} icon="email" />}
            onPress={() => router.push("/more/contact")} // Navigate to the nested contact screen
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>{labels.settings}</List.Subheader>
          <List.Item
            title={labels.language}
            left={(p) => <List.Icon {...p} icon="translate" />}
            onPress={() => router.push("/more/language")} // Navigate to the nested language screen
          />
          <List.Item
            title={labels.darkMode}
            left={(p) => <List.Icon {...p} icon="theme-light-dark" />}
            right={() => <Switch value={isDark} onValueChange={toggleTheme} />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>{labels.community}</List.Subheader>
          <List.Item
            title={labels.give}
            left={(p) => <List.Icon {...p} icon="gift" />}
            onPress={openOnlineGiving}
          />
        </List.Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
