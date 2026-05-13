import { UpdateContext } from "@/app/_layout";
import { MenuCard } from "@/components/MenuCard";
import { openOnlineGiving } from "@/constants/ExternalLinks";
import { LanguageContext } from "@/constants/LanguageContext";
import { DESIGN_TOKENS } from "@/constants/Layout";
import { ThemeContext, useAppTheme } from "@/constants/Themes";
import packageJson from "@/package.json";
import { NavigationStyles } from "@/styles/NavigationStyles";
import { router, Stack } from "expo-router";
import { useContext } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { List, Switch, Text, TouchableRipple } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const allLabels = {
  en: {
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

export default function YouScreen() {
  const theme = useAppTheme();
  const { language } = useContext(LanguageContext);
  const { toggleTheme } = useContext(ThemeContext);
  const { onManualCheck, updateStatus } = useContext(UpdateContext);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;
  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  return (
    <>
      <Stack.Screen options={{ title: labels.settings }} />
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
              <Switch
                value={theme.dark}
                onValueChange={toggleTheme}
                color={theme.colors.primary}
              />
            )}
            onPress={() => toggleTheme()}
          />
          <MenuCard
            title={labels.language}
            description={labels.languageSub}
            icon="translate"
            iconColor={theme.colors.tertiary}
            onPress={() => router.push("/you/language" as any)}
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
            onPress={() => router.push("/you/about" as any)}
          />
          <MenuCard
            title={labels.contact}
            description={labels.contactSub}
            icon="email"
            iconColor={theme.colors.tertiary}
            onPress={() => router.push("/you/contact" as any)}
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
            rightIcon="open-in-new"
            onPress={openOnlineGiving}
          />
        </List.Section>

        <View style={styles.footer}>
          <TouchableRipple
            onPress={Platform.OS === "web" ? () => onManualCheck() : undefined}
            disabled={updateStatus !== "idle"}
            style={styles.versionRipple}
          >
            <Text
              variant="labelSmall"
              style={[
                styles.versionText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Version {packageJson.version}
            </Text>
          </TouchableRipple>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 32,
    marginBottom: 48,
    alignItems: "center",
  },
  versionRipple: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  versionText: {
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
