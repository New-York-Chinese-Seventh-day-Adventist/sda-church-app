import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet } from "react-native";
import { Divider, List, Switch, useTheme } from "react-native-paper";
import { openOnlineGiving } from "../../../utils/externalLinks";
import { LanguageContext, ThemeContext } from "../../_layout";

export default function MoreScreen() {
  const { language } = useContext(LanguageContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const theme = useTheme();
  const { highlight } = useLocalSearchParams();
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const allLabels = {
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
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  useEffect(() => {
    if (highlight) {
      setActiveHighlight(highlight as string);
      // Flicker animation: pulse the background
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
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

        <Divider />

        <List.Section>
          <List.Subheader>{labels.community}</List.Subheader>
          <Animated.View style={getHighlightStyle("give")}>
            <List.Item
              title={labels.give}
              left={(p) => <List.Icon {...p} icon="gift" />}
              right={(p) => <List.Icon {...p} icon="open-in-new" />}
              onPress={openOnlineGiving}
            />
          </Animated.View>
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
