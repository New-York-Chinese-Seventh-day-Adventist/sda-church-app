import { router } from "expo-router";
import React, { useContext } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
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
      about: "About Us",
      contact: "Connect with Us",
    },
    zh: {
      header: "基督復臨安息日會",
      welcome: "歡迎來到我們的社區",
      subtitle: "安息日快樂！",
      verse: "耶和華是我的牧者，我必不致缺乏。 - 詩篇 23:1",
      livestream: "觀看直播",
      about: "關於我們",
      contact: "聯繫我們",
    },
    "zh-cn": {
      header: "基督复临安息日会",
      welcome: "欢迎来到我们的社区",
      subtitle: "安息日快乐！",
      verse: "耶和华是我的牧者，我必不致缺乏。 - 诗篇 23:1",
      livestream: "观看直播",
      about: "关于我们",
      contact: "联系我们",
    },
    es: {
      header: "Iglesia Adventista",
      welcome: "Bienvenido a nuestra comunidad",
      subtitle: "¡Feliz Sábado!",
      verse: "Jehová es mi pastor; nada me faltará. - Salmo 23:1",
      livestream: "Ver Transmisión",
      about: "Sobre Nosotros",
      contact: "Conéctate con Nosotros",
    },
  }[language as "en" | "zh" | "zh-cn" | "es"];

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.hero}>
          <Text variant="headlineMedium" style={styles.welcomeText}>
            {labels.welcome}
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
            {labels.subtitle}
          </Text>
        </View>

        <Card style={styles.card} onPress={openSabbathStream}>
          <Card.Cover source={require("../../assets/images/youtube_art.png")} />
          <Card.Content style={{ marginTop: 16, alignItems: "center" }}>
            <Button
              mode="contained"
              icon="youtube"
              onPress={openSabbathStream}
              buttonColor="#FF0000" // YouTube Brand Red
              textColor="#FFFFFF"
              style={styles.button}
            >
              {labels.livestream}
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyLarge" style={styles.verseText}>
              {labels.verse}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.actionContainer}>
          <Button
            mode="contained-tonal"
            icon="information"
            onPress={() => router.push("/more/about" as any)}
            style={[styles.button, { marginBottom: 12 }]}
          >
            {labels.about}
          </Button>

          <Button
            mode="outlined"
            icon="map-marker"
            onPress={() =>
              router.push({
                pathname: "/more/contact",
                params: { backTo: "/" },
              })
            }
            style={styles.button}
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
