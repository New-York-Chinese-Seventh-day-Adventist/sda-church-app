import { LanguageContext } from "@/constants/Contexts";
import React, { useContext } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import { openSpotifyPodcast } from "../../utils/spotifyService";
import { openSabbathStream } from "../../utils/youtubeService";

export default function ResourcesScreen() {
  const theme = useTheme();
  const { language } = useContext(LanguageContext);

  const allLabels = {
    en: {
      title: "Study Podcast",
      description: "Explore our library of teachings in English and Mandarin.",
      button: "Listen on Spotify",
      youtubeTitle: "Past Services",
      youtubeDescription: "Watch our archive or join us live on YouTube",
      youtubeButton: "Watch our past sermons on YouTube",
    },
    zh: {
      title: "研經播客",
      description: "探索我們的英文和國語教學庫。",
      button: "在 Spotify 上收聽",
      youtubeTitle: "歷次聚會",
      youtubeDescription: "在 YouTube 上收看我們的存檔或加入直播",
      youtubeButton: "在 YouTube 上觀看過往講道",
    },
    "zh-cn": {
      title: "研经播客",
      description: "探索我们的英文和国语教学库。",
      button: "在 Spotify 上收听",
      youtubeTitle: "历次聚会",
      youtubeDescription: "在 YouTube 上收看我们的存档或加入直播",
      youtubeButton: "在 YouTube 上观看过往讲道",
    },
    es: {
      title: "Podcast de Estudio",
      description:
        "Explore nuestra biblioteca de enseñanzas en inglés y mandarín.",
      button: "Escuchar en Spotify",
      youtubeTitle: "Servicios Pasados",
      youtubeDescription:
        "Vea nuestro archivo o únase a nosotros en vivo en YouTube",
      youtubeButton: "Vea nuestros sermones pasados en YouTube",
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Card style={styles.card} mode="elevated">
        <Card.Cover source={require("../../assets/images/youtube_art.png")} />
        <Card.Content style={styles.cardContent}>
          <Text variant="headlineSmall" style={styles.title}>
            {labels.youtubeTitle}
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {labels.youtubeDescription}
          </Text>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button
            icon="youtube"
            mode="contained"
            onPress={openSabbathStream}
            buttonColor="#FF0000" // YouTube Brand Red
            textColor="#FFFFFF"
            style={styles.button}
          >
            {labels.youtubeButton}
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card} mode="elevated">
        <Card.Cover
          source={require("../../assets/images/spotify_podcast_art.png")}
        />
        <Card.Content style={styles.cardContent}>
          <Text variant="headlineSmall" style={styles.title}>
            {labels.title}
          </Text>
          <Text variant="bodyMedium" style={styles.description}>
            {labels.description}
          </Text>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button
            icon="spotify"
            mode="contained"
            onPress={openSpotifyPodcast}
            buttonColor="#1DB954" // Spotify Brand Green
            textColor="#FFFFFF"
            style={styles.button}
          >
            {labels.button}
          </Button>
        </Card.Actions>
        <Text
          variant="labelSmall"
          style={[styles.spotifyBranding, { color: theme.colors.outline }]}
        >
          Powered by Spotify
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    overflow: "hidden",
  },
  cardContent: {
    marginTop: 16,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    justifyContent: "center",
  },
  button: {
    width: "100%",
  },
  spotifyBranding: {
    textAlign: "center",
    marginBottom: 12,
  },
});
