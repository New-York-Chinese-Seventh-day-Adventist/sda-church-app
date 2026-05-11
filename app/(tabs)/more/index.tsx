import { MenuCard } from "@/components/MenuCard";
import { LanguageContext, ThemeContext } from "@/constants/Contexts";
import { DESIGN_TOKENS } from "@/constants/Layout";
import { NavigationStyles } from "@/styles/NavigationStyles";
import { router, Stack } from "expo-router";
import React, { useContext } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { List, Switch, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const allLabels = {
  en: {
    title: "More",
    settings: "Settings",
    give: "Give",
    giveSub: "Support our ministry",
    darkMode: "Dark Mode",
    darkModeSub: "Toggle between light and dark themes",
    language: "Language",
    languageSub: "Change app language",
    about: "About Us",
    aboutSub: "Learn about our church's history and beliefs",
    contact: "Connect",
    contactSub: "Contact information and locations",
  },
  zh: {
    title: "更多",
    settings: "設定",
    give: "奉獻",
    giveSub: "支持我們的聖工",
    darkMode: "深色模式",
    darkModeSub: "切換淺色和深色主題",
    language: "語言",
    languageSub: "更改應用程式語言",
    about: "關於我們",
    aboutSub: "了解我們教會的歷史和信仰",
    contact: "聯繫",
    contactSub: "聯繫方式和地點",
  },
  "zh-cn": {
    title: "更多",
    settings: "设置",
    give: "奉献",
    giveSub: "支持我们的圣工",
    darkMode: "深色模式",
    darkModeSub: "切换浅色和深色主题",
    language: "语言",
    languageSub: "更改应用语言",
    about: "关于我们",
    aboutSub: "了解我们教会的历史和信仰",
    contact: "联系",
    contactSub: "联系方式和地点",
  },
  es: {
    title: "Más",
    settings: "Ajustes",
    give: "Dar",
    giveSub: "Apoya nuestro ministerio",
    darkMode: "Modo Oscuro",
    darkModeSub: "Alternar entre temas claros y oscuros",
    language: "Idioma",
    languageSub: "Cambiar idioma de la aplicación",
    about: "Sobre Nosotros",
    aboutSub: "Conoce la historia y creencias de nuestra iglesia",
    contact: "Conectar",
    contactSub: "Información de contacto y ubicaciones",
  },
};

export default function MoreScreen() {
  const theme = useTheme();
  const { language } = useContext(LanguageContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;
  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  return (
    <>
      <Stack.Screen options={{ title: labels.title }} />
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
            {labels.settings}
          </List.Subheader>
          <MenuCard
            title={labels.darkMode}
            description={labels.darkModeSub}
            icon="theme-light-dark"
            iconColor={theme.colors.primary} // Use primary color for dark mode toggle
            rightElement={() => (
              <Switch value={isDark} onValueChange={toggleTheme} />
            )}
            onPress={() => toggleTheme()}
          />
          <MenuCard
            title={labels.language}
            description={labels.languageSub}
            icon="translate"
            iconColor={theme.colors.tertiary}
            onPress={() => router.push("/more/language" as any)}
          />
        </List.Section>

        <List.Section>
          <List.Subheader
            style={[
              NavigationStyles.subheader,
              { color: theme.colors.onBackground },
            ]}
          >
            {labels.about}
          </List.Subheader>
          <MenuCard
            title={labels.about}
            description={labels.aboutSub}
            icon="information"
            iconColor={theme.colors.tertiary}
            onPress={() => router.push("/more/about" as any)}
          />
          <MenuCard
            title={labels.contact}
            description={labels.contactSub}
            icon="email"
            iconColor={theme.colors.tertiary}
            onPress={() => router.push("/more/contact" as any)}
          />
        </List.Section>

        <List.Section>
          <List.Subheader
            style={[
              NavigationStyles.subheader,
              { color: theme.colors.onBackground },
            ]}
          >
            {labels.give}
          </List.Subheader>
          <MenuCard
            title={labels.give}
            description={labels.giveSub}
            icon="gift"
            iconColor={theme.colors.tertiary}
            onPress={() => {}} // TODO: Implement giving page
          />
        </List.Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({});
