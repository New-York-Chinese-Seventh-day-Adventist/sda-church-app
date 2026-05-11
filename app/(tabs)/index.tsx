import { MenuCard } from "@/components/MenuCard";
import { LanguageContext } from "@/constants/Contexts";
import { DESIGN_TOKENS } from "@/constants/Layout";
import { router } from "expo-router";
import React, { useContext } from "react";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { openSabbathStream } from "../../utils/youtubeService";

export default function HomeScreen() {
  const { language } = useContext(LanguageContext);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const aboutImageUrl = process.env.EXPO_PUBLIC_ABOUT_IMAGE_URL;

  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const allLabels = {
    en: {
      header: "SDA Church",
      welcome: "Welcome to our Church",
      subtitle: "The Lord is my shepherd; I lack nothing.\nPsalm 23:1",
      livestream: "Watch Livestream",
      about: "About Us",
      contact: "Connect with Us",
    },
    zh: {
      header: "基督復臨安息日會",
      welcome: "歡迎來到我們的教會",
      subtitle: "耶和華是我的牧者，我必不致缺乏。\n詩篇 23:1",
      livestream: "觀看直播",
      about: "關於我們",
      contact: "聯繫我們",
    },
    "zh-cn": {
      header: "基督复临安息日会",
      welcome: "欢迎来到我们的教会",
      subtitle: "耶和华是我的牧者，我必不致缺乏。\n诗篇 23:1",
      livestream: "观看直播",
      about: "关于我们",
      contact: "联系我们",
    },
    es: {
      header: "Iglesia Adventista",
      welcome: "Bienvenido a nuestra iglesia",
      subtitle: "Jehová es mi pastor; nada me faltará.\nSalmo 23:1",
      livestream: "Ver Transmisión",
      about: "Sobre Nosotros",
      contact: "Conéctate con Nosotros",
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: headerHeight }}
      >
        <ImageBackground
          source={{ uri: aboutImageUrl }}
          style={styles.hero}
          resizeMode="cover"
        >
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: theme.colors.surface, opacity: 0.7 },
            ]}
          />
          <Text variant="headlineMedium" style={styles.welcomeText}>
            {labels.welcome}
          </Text>
          <Text
            variant="titleMedium"
            style={{
              color: theme.colors.onSurface,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            {labels.subtitle}
          </Text>
        </ImageBackground>

        <Card style={styles.card} onPress={openSabbathStream}>
          <Card.Cover source={require("../../assets/images/youtube_art.png")} />
          <Card.Content style={{ marginTop: 16, alignItems: "center" }}>
            <Button
              mode="contained"
              icon="youtube"
              onPress={openSabbathStream}
              // YouTube Brand Red in light mode, monochrome in dark mode.
              buttonColor={
                theme.dark ? theme.colors.onSurfaceVariant : "#FF0000"
              }
              textColor={theme.colors.onPrimary}
              style={styles.button}
            >
              {labels.livestream}
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.actionContainer}>
          <MenuCard
            title={labels.about}
            icon="information"
            iconColor={theme.dark ? "#FFFFFF" : theme.colors.primary}
            onPress={() => router.push("/more/about" as any)}
            style={{ marginBottom: 12 }}
          />

          <MenuCard
            title={labels.contact}
            icon="map-marker"
            iconColor={theme.dark ? "#FFFFFF" : theme.colors.primary}
            onPress={() =>
              router.push({
                pathname: "/more/contact",
                params: { backTo: "/" },
              })
            }
          />
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
  actionContainer: { paddingHorizontal: 16, paddingBottom: 80 },
});
