import { router } from "expo-router";
import React, { useContext } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Card, Text, useTheme } from "react-native-paper";
import { openSabbathStream } from "../../utils/youtubeService";
import { LanguageContext } from "../_layout";

export default function HomeScreen() {
  const { language } = useContext(LanguageContext);
  const theme = useTheme();

  const labels = {
    en: {
      header: "SDA Church",
      welcome: "Welcome to our Community",
      subtitle: "Happy Sabbath!",
      verse: "The Lord is my shepherd; I shall not want. - Psalm 23:1",
      livestream: "Watch Livestream",
      contact: "Contact Us",
    },
    zh: {
      header: "基督復臨安息日會",
      welcome: "歡迎來到我們的社區",
      subtitle: "安息日快樂！",
      verse: "耶和華是我的牧者，我必不致缺乏。 - 詩篇 23:1",
      livestream: "觀看直播",
      contact: "聯絡我們",
    },
    "zh-cn": {
      header: "基督复临安息日会",
      welcome: "欢迎来到我们的社区",
      subtitle: "安息日快乐！",
      verse: "耶和华是我的牧者，我必不致缺乏。 - 诗篇 23:1",
      livestream: "观看直播",
      contact: "联系我们",
    },
    es: {
      header: "Iglesia Adventista",
      welcome: "Bienvenido a nuestra comunidad",
      subtitle: "¡Feliz Sábado!",
      verse: "Jehová es mi pastor; nada me faltará. - Salmo 23:1",
      livestream: "Ver Transmisión",
      contact: "Contáctenos",
    },
  }[language as "en" | "zh" | "zh-cn" | "es"] || {
    header: "SDA Church",
    welcome: "Welcome",
    subtitle: "",
    verse: "",
    livestream: "Watch Livestream",
    contact: "Contact Us",
  };

  return (
    <>
      <Appbar.Header elevated>
        <Appbar.Content title={labels.header} />
      </Appbar.Header>
      <ScrollView style={styles.container}>
        <View style={styles.hero}>
          <Text variant="headlineMedium" style={styles.welcomeText}>
            {labels.welcome}
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
            {labels.subtitle}
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.verseText}>
              {labels.verse}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            icon="youtube"
            onPress={openSabbathStream}
            style={styles.button}
          >
            {labels.livestream}
          </Button>
          <Button
            mode="outlined"
            icon="email"
            onPress={() => router.push("/more/contact")}
            style={[styles.button, { marginTop: 12 }]}
          >
            {labels.contact}
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: 24, alignItems: "center", justifyContent: "center" },
  welcomeText: { fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  card: { margin: 16, padding: 8 },
  verseText: { fontStyle: "italic", textAlign: "center" },
  actionContainer: { padding: 16, alignItems: "center" },
  button: { width: "80%" },
});
