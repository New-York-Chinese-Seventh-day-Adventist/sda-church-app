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
  const aboutImageUrl = process.env.EXPO_PUBLIC_ABOUT_IMAGE_URL;

  const allLabels = {
    en: {
      title: "About Us",
      aboutSDA: "About the Seventh-day Adventist Church",
      sdaDescription:
        "Seventh-day Adventists are a global Christian community that regards the Bible as the supreme authority in their lives. We adhere to the principle of Sola Scriptura (By Scripture Alone), which means that the Bible is the sole infallible source of authority for Christian faith and practice, and the standard by which all teachings and experiences are measured.",
      history: "Our History",
      historySubtext:
        "The New York Chinese Seventh-day Adventist Church began as a humble gathering of 25 members in 1973, meeting in a private home to share their faith. As the community grew, the group transitioned through various rented spaces under the leadership of dedicated pastors.\n\n" +
        "Key Milestones:\n" +
        "• 1987: The congregation was officially organized.\n" +
        "• 1996: The church was formally accepted into the sisterhood of churches within the New York Conference.\n" +
        "• 1999: After years of planning and faith, the community celebrated the opening of its permanent home at 7606 41st Avenue in Elmhurst.\n\n" +
        "Today, we are a vibrant, bilingual community offering services in Mandarin and English. We remain dedicated to our mission of outreach, supporting our neighbors in Queens and Brooklyn through community programs and the planting of new fellowships.",
      beliefs: "Our Beliefs",
      beliefsSubtext:
        "The 28 Fundamental Beliefs outline how Seventh-day Adventists apply Sola Scriptura principles in daily life.",
      learnMore: "Learn More About Our Beliefs",
    },
    zh: {
      title: "關於我們",
      aboutSDA: "關於基督復臨安息日會",
      sdaDescription:
        "基督復臨安息日會是一個全球性的基督徒團體，將聖經視為生活的最高權威。我們堅持「唯獨聖經」(Sola Scriptura) 的原則，這意味著聖經是基督徒信仰和實踐的唯一無誤權威來源，也是衡量所有教導和經驗的標準。",
      history: "我們的歷史",
      historySubtext:
        "紐約華人基督復臨安息日會始於 1973 年，最初只有 25 名成員，他們在私人住宅中聚會分享信仰。隨著社群的壯大，在熱心牧師的帶領下，小組經歷了各種租用的空間。\n\n" +
        "關鍵里程碑：\n" +
        "• 1987：會眾正式成立。\n" +
        "• 1996：教會正式加入紐約區會。\n" +
        "• 1999：經過多年的規劃和信心，社群慶祝了位於 Elmhurst 41 大道 7606 號的永久會所落成。\n\n" +
        "今天，我們是一個充滿活力的雙語社群，提供國語和英語服務。我們始終致力於外展使命，透過社區計劃和建立新的團契來支持皇后區和布魯克林的鄰居。",
      beliefs: "我們的信仰",
      beliefsSubtext:
        "28 條基本信仰概述了基督復臨安息日會信徒如何在日常生活中應用唯獨聖經的原則。",
      learnMore: "進一步了解我們的信仰",
    },
    "zh-cn": {
      title: "关于我们",
      aboutSDA: "关于基督复临安息日会",
      sdaDescription:
        "基督复临安息日会是一个全球性的基督徒团体，将圣经视为生活的最高权威。我们坚持“唯独圣经”(Sola Scriptura) 的原则，这意味着圣经是基督徒信仰和实践的唯一无误权威来源，也是衡量所有教导和经验的标准。",
      history: "我们的历史",
      historySubtext:
        "纽约华人基督复临安息日会始于 1973 年，最初只有 25 名成员，他们在私人住宅中聚会分享信仰。随着社群的壮大，在热心牧师的带领下，小组经历了各种租用的空间。\n\n" +
        "关键里程碑：\n" +
        "• 1987：会众正式成立。\n" +
        "• 1996：教会正式加入纽约区会。\n" +
        "• 1999：经过多年的规划和信心，社群庆祝了位于 Elmhurst 41 大道 7606 号的永久会所落成。\n\n" +
        "今天，我们是一个充满活力的双语社群，提供国语和英语服务。我们始终致力于外展使命，通过社区计划和建立新的团契来支持皇后区和布鲁克林的邻居。",
      beliefs: "我们的信仰",
      beliefsSubtext:
        "28 条基本信仰概述了基督复临安息日会信徒如何在日常生活中应用唯独圣经的原则。",
      learnMore: "进一步了解我们的信仰",
    },
    es: {
      title: "Sobre Nosotros",
      aboutSDA: "Acerca de la Iglesia Adventista del Séptimo Día",
      sdaDescription:
        "Los Adventistas del Séptimo Día son una comunidad cristiana global que considera la Biblia como la autoridad suprema en sus vidas. Nos adherimos al principio de Sola Scriptura (Solo por la Escritura), lo que significa que la Biblia es la única fuente infalible de autoridad para la fe y la práctica cristiana, y el estándar por el cual se miden todas las enseñanzas y experiencias.",
      history: "Nuestra Historia",
      historySubtext:
        "La Iglesia Adventista del Séptimo Día de Nueva York comenzó como una humilde reunión de 25 miembros en 1973, reuniéndose en una casa particular para compartir su fe. A medida que la comunidad creció, el grupo pasó por varios espacios alquilados bajo el liderazgo de pastores dedicados.\n\n" +
        "Hitos clave:\n" +
        "• 1987: La congregación fue organizada oficialmente.\n" +
        "• 1996: La iglesia fue aceptada formalmente en la hermandad de iglesias dentro de la Conferencia de Nueva York.\n" +
        "• 1999: Después de años de planificación y fe, la comunidad celebró la apertura de su hogar permanente en 7606 41st Avenue en Elmhurst.\n\n" +
        "Hoy, somos una comunidad vibrante y bilingüe que ofrece servicios en mandarín e inglés. Seguimos dedicados a nuestra misión de alcance, apoyando a nuestros vecinos en Queens y Brooklyn a través de programas comunitarios y la plantación de nuevos compañerismos.",
      beliefs: "Nuestras Creencias",
      beliefsSubtext:
        "Las 28 Creencias Fundamentales describen cómo los Adventistas del Séptimo Día aplican los principios de Sola Scriptura en la vida diaria.",
      learnMore: "Más Información Sobre Nuestras Creencias",
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  const openBeliefs = () => {
    Linking.openURL("https://adventist.org/beliefs#official-beliefs");
  };

  return (
    <>
      <Stack.Screen options={{ title: labels.title }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: aboutImageUrl }}
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
