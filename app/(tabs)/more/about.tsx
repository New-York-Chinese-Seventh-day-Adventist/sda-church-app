import { Stack } from "expo-router";
import React, { useContext } from "react";
import { Image, Linking, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Paragraph,
  Text,
  Title,
  useTheme,
} from "react-native-paper";
import { LanguageContext } from "../../_layout";

export default function AboutScreen() {
  const { language } = useContext(LanguageContext);
  const theme = useTheme();
  const churchName = process.env.EXPO_PUBLIC_CHURCH_NAME || "SDA Church";

  const labels =
    {
      en: {
        title: "About Us",
        aboutSDA: "About the Seventh-day Adventist Church",
        sdaDescription:
          "Seventh-day Adventists are a global Christian community that regards the Bible as the supreme authority in their lives. They stress the importance of following biblical teachings and living in accordance with these principles.",
        history: "History",
        historySubtext: "TBD",
        beliefs: "Our Beliefs",
        beliefsSubtext:
          "The 28 Fundamental Beliefs outline how Seventh-day Adventists apply Sola Scriptura principles in daily life.",
        learnMore: "Learn More About Our Beliefs",
      },
      zh: {
        title: "關於我們",
        aboutSDA: "關於基督復臨安息日會",
        sdaDescription:
          "基督復臨安息日會是一個全球性的基督徒團體，將聖經視為生活的最高權威。他們強調遵循聖經教導並按照這些原則生活的重要性。",
        history: "歷史",
        historySubtext: "待定",
        beliefs: "我們的信仰",
        beliefsSubtext:
          "28 條基本信仰概述了基督復臨安息日會信徒如何在日常生活中應用唯獨聖經的原則。",
        learnMore: "進一步了解我們的信仰",
      },
      "zh-cn": {
        title: "关于我们",
        aboutSDA: "关于基督复临安息日会",
        sdaDescription:
          "基督复临安息日会是一个全球性的基督徒团体，将圣经视为生活的最高权威。他们强调遵循圣经教导并按照这些原则生活的重要性。",
        history: "历史",
        historySubtext: "待定",
        beliefs: "我们的信仰",
        beliefsSubtext:
          "28 条基本信仰概述了基督复临安息日会信徒如何在日常生活中应用唯独圣经的原则。",
        learnMore: "进一步了解我们的信仰",
      },
      es: {
        title: "Sobre Nosotros",
        aboutSDA: "Acerca de la Iglesia Adventista del Séptimo Día",
        sdaDescription:
          "Los Adventistas del Séptimo Día son una comunidad cristiana global que considera la Biblia como la autoridad suprema en sus vidas. Destacan la importancia de seguir las enseñanzas bíblicas y vivir de acuerdo con estos principios.",
        history: "Historia",
        historySubtext: "TBD",
        beliefs: "Nuestras Creencias",
        beliefsSubtext:
          "Las 28 Creencias Fundamentales describen cómo los Adventistas del Séptimo Día aplican los principios de Sola Scriptura en la vida diaria.",
        learnMore: "Más Información Sobre Nuestras Creencias",
      },
    }[language as "en" | "zh" | "zh-cn" | "es"] || labels.en;

  const openBeliefs = () => {
    Linking.openURL("https://adventist.org/beliefs#official-beliefs");
  };

  return (
    <>
      <Stack.Screen options={{ title: labels.title }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: "https://picsum.photos/seed/sda/800/400" }}
            style={styles.image}
            accessibilityLabel="Church banner"
          />
          <Title style={styles.churchName}>{churchName}</Title>
        </View>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>{labels.aboutSDA}</Title>
          <Paragraph style={styles.description}>
            {labels.sdaDescription}
          </Paragraph>
        </View>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>{labels.history}</Title>
          <Text variant="bodyMedium">{labels.historySubtext}</Text>
        </View>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>{labels.beliefs}</Title>
          <Text variant="bodyMedium" style={styles.subtext}>
            {labels.beliefsSubtext}
          </Text>

          <View style={styles.cardContainer}>
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text variant="titleMedium">Holy Scriptures</Text>
                <Text variant="bodySmall">
                  The Holy Scriptures are the infallible revelation of God's
                  will.
                </Text>
              </Card.Content>
            </Card>
            <Card style={styles.card} mode="elevated">
              <Card.Content>
                <Text variant="titleMedium">The Trinity</Text>
                <Text variant="bodySmall">
                  There is one God: Father, Son, and Holy Spirit.
                </Text>
              </Card.Content>
            </Card>
          </View>

          <Button
            mode="contained"
            onPress={openBeliefs}
            style={styles.button}
            icon="open-in-new"
          >
            {labels.learnMore}
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 200,
  },
  churchName: {
    padding: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
  },
  subtext: {
    marginBottom: 12,
  },
  cardContainer: {
    marginVertical: 8,
  },
  card: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
});
