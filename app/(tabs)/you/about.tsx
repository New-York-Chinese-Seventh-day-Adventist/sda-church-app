import {
  CHURCH_BUILDING_IMAGE_URL,
  CHURCH_NAME,
  openAtlanticUnion,
  openBeliefs,
  openGNYC,
} from "@/constants/ExternalLinks";
import { LanguageContext } from "@/constants/LanguageContext";
import { DESIGN_TOKENS } from "@/constants/Layout";
import { useAppTheme } from "@/constants/Themes";
import { DocumentStyles } from "@/styles/DocumentStyles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Stack } from "expo-router";
import { useContext } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Paragraph, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AboutScreen() {
  const { language } = useContext(LanguageContext);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const allLabels = {
    en: {
      title: "About Us",
      aboutSDA: "About the Seventh-day Adventist Church",
      sdaDescription:
        "Seventh-day Adventists are a global Christian community that regards the Bible as the supreme authority in their lives. We adhere to the principle of Sola Scriptura (By Scripture Alone), which means that the Bible is the sole infallible source of authority for Christian faith and practice, and the standard by which all teachings and experiences are measured.",
      pillarItems: [
        { title: "Bible-Centered", icon: "book-cross" },
        { title: "Faith & Love", icon: "heart-flash" },
        { title: "Community", icon: "account-group" },
      ],
      history: "Our History",
      historySubtext:
        "The New York Chinese Seventh-day Adventist Church began as a humble gathering in 1973. Today, we are a vibrant community dedicated to outreach and supporting our neighbors.",
      milestoneItems: [
        { year: "1973", event: "First home gathering" },
        { year: "1987", event: "Officially organized" },
        { year: "1996", event: "Joined conference" },
        { year: "1999", event: "Opened permanent home" },
      ],
      beliefs: "Our Beliefs",
      beliefsSubtext:
        "The 28 Fundamental Beliefs outline how Seventh-day Adventists apply Sola Scriptura principles in daily life.",
      beliefsNote:
        "These are a few of our core pillars. We hold 28 fundamental beliefs that guide our community.",
      learnMore: "Learn More About Our Beliefs",
      beliefsItems: [
        {
          title: "Creation",
          description:
            "We believe God is the Creator of all things, revealing His love through the beautiful world He made for us.",
          icon: "creation",
        },
        {
          title: "The Nature of Humanity",
          description:
            "Created in God's image, we have the power to choose, yet we often struggle with our own brokenness and need for redemption.",
          icon: "account",
        },
        {
          title: "The Great Controversy",
          description:
            "We are part of a universal conflict between good and evil that explains the suffering we see in our world.",
          icon: "sword-cross",
        },
        {
          title: "God the Son",
          description:
            "Jesus is truly God, who became human to live among us and reconcile us to the Father.",
          icon: "crown",
        },
        {
          title: "Life, Death, and Resurrection of Christ",
          description:
            "Through Jesus' perfect life and sacrifice on the cross, He provided the only way for us to be forgiven and restored.",
          icon: "heart",
        },
        {
          title: "Experience of Salvation",
          description:
            "By faith in Jesus, we are adopted into God's family and delivered from the power of our past mistakes.",
          icon: "gift",
        },
        {
          title: "Growing in Christ",
          description:
            "Through the Holy Spirit, we are empowered to live a life of peace, spiritual growth, and service to others.",
          icon: "sprout",
        },
        {
          title: "The Sabbath",
          description:
            "The seventh-day Sabbath is a weekly gift from God, a time for rest, worship, and community.",
          icon: "calendar-heart",
        },
        {
          title: "The Second Coming of Christ",
          description:
            'The return of Jesus is our "blessed hope," marking the day when He will finally restore all things.',
          icon: "trumpet",
        },
        {
          title: "The New Earth",
          description:
            "God will create a home where righteousness dwells, and there will be no more pain, suffering, or death.",
          icon: "earth",
        },
      ],
      organization: "Church Organization",
      localConference: "Local Conference",
      localConfName: "Greater New York Conference",
      localConfDesc:
        "Our local congregation is part of a network of churches across the New York metropolitan area.",
      unionConference: "Union Conference",
      unionConfName: "Atlantic Union Conference",
      unionConfDesc:
        "The Atlantic Union coordinates Adventist mission and education across the Northeast United States and Bermuda.",
    },
    zh: {
      title: "關於我們",
      aboutSDA: "關於基督復臨安息日會",
      sdaDescription:
        "基督復臨安息日會是一個全球性的基督徒團體, 將聖經視為生活的最高權威。我們堅持「唯獨聖經」(Sola Scriptura) 的原則, 這意味著聖經是基督徒信仰和實踐的唯一無誤權威來源, 也是衡量所有教導和經驗的標準。",
      pillarItems: [
        { title: "以聖經為中心", icon: "book-cross" },
        { title: "信仰與愛", icon: "heart-flash" },
        { title: "社群", icon: "account-group" },
      ],
      history: "我們的歷史",
      historySubtext:
        "紐約華人基督復臨安息日會始於 1973 年。今天, 我們是一個充滿活力的雙語社群, 始終致力於外展使命並支持鄰居。",
      milestoneItems: [
        { year: "1973", event: "首次住宅聚會" },
        { year: "1987", event: "會眾正式成立" },
        { year: "1996", event: "加入紐約區會" },
        { year: "1999", event: "永久會所落成" },
      ],
      beliefs: "我們的信仰",
      beliefsSubtext:
        "28 條基本信仰概述了基督復臨安息日會信徒如何在日常生活中應用唯獨聖經的原則。",
      beliefsNote:
        "這些是我們信仰核心支柱中的一部分。我們共有 28 條基本信仰指引著我們的社群。",
      learnMore: "進一步了解我們的信仰",
      beliefsItems: [
        {
          title: "創造",
          description:
            "我們相信上帝是萬物的創造主, 通過祂為我們創造的美麗世界展現了祂的愛。",
          icon: "creation",
        },
        {
          title: "人性的本質",
          description:
            "我們是按上帝的形象創造的, 具有選擇的力量, 但我們常在自身的破碎中掙扎, 需要救贖。",
          icon: "account",
        },
        {
          title: "善惡之爭",
          description:
            "我們參與了一場善與惡之間的普世衝突, 這解釋了我們在世上所見的苦難。",
          icon: "sword-cross",
        },
        {
          title: "聖子上帝",
          description:
            "耶穌是真實的上帝, 祂降世為人生活在我們中間, 使我們與天父和好。",
          icon: "crown",
        },
        {
          title: "基督的生、死與復活",
          description:
            "通過耶穌完美的生命和在十字架上的犧牲, 祂提供了我們獲得寬恕與復興的唯一途徑。",
          icon: "heart",
        },
        {
          title: "得救經驗",
          description:
            "藉著對耶穌的信仰, 我們被接納進入上帝的家, 並從過去錯誤的權勢中得到釋放。",
          icon: "gift",
        },
        {
          title: "在基督裡成長",
          description:
            "通過聖靈, 我們得到授權, 過著平安, 靈命成長和服事他人的生活。",
          icon: "sprout",
        },
        {
          title: "安息日",
          description:
            "第七日的安息日是上帝賜予的每週禮物, 一個安息, 崇拜和團契的時間。",
          icon: "calendar-heart",
        },
        {
          title: "基督復臨",
          description:
            "耶穌的復臨是我們「蒙福的指望」, 標誌著祂最終復興萬物的那一天。",
          icon: "trumpet",
        },
        {
          title: "新地",
          description:
            "上帝將創造一個公義居住的家園, 那裡將不再有痛苦, 哀傷或死亡。",
          icon: "earth",
        },
      ],
      organization: "教會組織",
      localConference: "區會",
      localConfName: "大紐約區會",
      localConfDesc: "我們的在地會眾是大紐約大都會地區教會網絡的一部分。",
      unionConference: "聯合會",
      unionConfName: "大西洋聯合會",
      unionConfDesc:
        "大西洋聯合會負責協調美國東北部和百慕達地區的復臨教會使命與教育。",
    },
    "zh-cn": {
      title: "关于我们",
      aboutSDA: "关于基督复临安息日会",
      sdaDescription:
        "基督复临安息日会是一个全球性的基督徒团体, 将圣经视为生活的最高权威。我们坚持“唯独圣经”(Sola Scriptura) 的原则, 这意味着圣经是基督徒信仰和实践的唯一无误权威来源, 也是衡量所有教导和经验的标准。",
      pillarItems: [
        { title: "以圣经为中心", icon: "book-cross" },
        { title: "信仰与爱", icon: "heart-flash" },
        { title: "社区", icon: "account-group" },
      ],
      history: "我们的历史",
      historySubtext:
        "纽约华人基督复临安息日会始于 1973 年。今天, 我们是一个充满活力的双语社群, 始终致力于外展使命并支持邻居。",
      milestoneItems: [
        { year: "1973", event: "首次住宅聚会" },
        { year: "1987", event: "会众正式成立" },
        { year: "1996", event: "加入纽约区会" },
        { year: "1999", event: "永久会所落成" },
      ],
      beliefs: "我们的信仰",
      beliefsSubtext:
        "28 条基本信仰概述了基督复临安息日会信徒如何在日常生活中应用唯独圣经的原则。",
      beliefsNote:
        "这些是我们信仰核心支柱中的一部分。我们共有 28 条基本信仰指引着我们的社群。",
      learnMore: "进一步了解我们的信仰",
      beliefsItems: [
        {
          title: "创造",
          description:
            "我们相信上帝是万物的创造主, 通过祂为我们创造的美丽世界展现了祂的爱。",
          icon: "creation",
        },
        {
          title: "人性的本质",
          description:
            "我们是按上帝的形象创造的, 具有选择的力量, 但我们常在自身的破碎中挣扎, 需要救赎。",
          icon: "account",
        },
        {
          title: "善恶之争",
          description:
            "我们参与了一场善与恶之间的普世冲突, 这解释了我们在世上所见的苦难。",
          icon: "sword-cross",
        },
        {
          title: "圣子上帝",
          description:
            "耶稣是真实的上帝, 祂降世为人生活在我们中间, 使我们与天父和好。",
          icon: "crown",
        },
        {
          title: "基督的生、死与复活",
          description:
            "通过耶稣完美的生命和在十字架上的牺牲, 祂提供了我们获得宽恕与复兴的唯一途径。",
          icon: "heart",
        },
        {
          title: "得救经验",
          description:
            "藉着对耶稣的信仰, 我们被接纳进入上帝的家, 并从过去错误的权势中得到释放。",
          icon: "gift",
        },
        {
          title: "在基督里成长",
          description:
            "通过圣灵, 我们得到授权, 过着平安, 灵命成长和服事他人的生活。",
          icon: "sprout",
        },
        {
          title: "安息日",
          description:
            "第七日的安息日是上帝赐予的每周礼物, 一个安息, 崇拜和团契的时间。",
          icon: "calendar-heart",
        },
        {
          title: "基督复临",
          description:
            "耶稣的复临是我们“蒙福”的指望,标志着祂最终复兴万物的那一天。",
          icon: "trumpet",
        },
        {
          title: "新地",
          description:
            "上帝将创造一个公义居住的家园, 那里将不再有痛苦, 哀伤或死亡。",
          icon: "earth",
        },
      ],
      organization: "教会组织",
      localConference: "区会",
      localConfName: "大纽约区会",
      localConfDesc: "我们的在地会众是大纽约大都会地区教会网络的一部分。",
      unionConference: "联合会",
      unionConfName: "大西洋联合会",
      unionConfDesc:
        "大西洋联合会负责协调美国东北部和百慕大地区的复临教会使命与教育。",
    },
    es: {
      title: "Sobre Nosotros",
      aboutSDA: "Acerca de la Iglesia Adventista del Séptimo Día",
      sdaDescription:
        "Los Adventistas del Séptimo Día son una comunidad cristiana global que considera la Biblia como la autoridad suprema en sus vidas. Nos adherimos al principio de Sola Scriptura (Solo por la Escritura), lo que significa que la Biblia es la única fuente infalible de autoridad para la fe y la práctica cristiana, y el estándar por el cual se miden todas las enseñanzas y experiencias.",
      pillarItems: [
        { title: "Biblia", icon: "book-cross" },
        { title: "Fe y Amor", icon: "heart-flash" },
        { title: "Comunidad", icon: "account-group" },
      ],
      history: "Nuestra Historia",
      historySubtext:
        "La Iglesia Adventista del Séptimo Día de Nueva York comenzó como una humilde reunión en 1973. Hoy, somos una comunidad bilingüe vibrante dedicada a apoyar a nuestros vecinos.",
      milestoneItems: [
        { year: "1973", event: "Primera reunión" },
        { year: "1987", event: "Organizada" },
        { year: "1996", event: "Unión a conferencia" },
        { year: "1999", event: "Sede propia" },
      ],
      beliefs: "Nuestras Creencias",
      beliefsSubtext:
        "Las 28 Creencias Fundamentales describen cómo los Adventistas del Séptimo Día aplican los principios de Sola Scriptura en la vida diaria.",
      beliefsNote:
        "Estos son algunos de nuestros pilares fundamentales. Sostenemos 28 creencias fundamentales que guían a nuestra comunidad.",
      learnMore: "Más Información Sobre Nuestras Creencias",
      beliefsItems: [
        {
          title: "La Creación",
          description:
            "Creemos que Dios es el Creador de todas las cosas, revelando Su amor a través del hermoso mundo que hizo para nosotros.",
          icon: "creation",
        },
        {
          title: "La Naturaleza de la Humanidad",
          description:
            "Creados a imagen de Dios, tenemos el poder de elegir, pero a menudo luchamos con nuestra propia fragilidad y necesidad de redención.",
          icon: "account",
        },
        {
          title: "El Gran Conflicto",
          description:
            "Somos parte de un conflicto universal entre el bien y el mal que explica el sufrimiento que vemos en nuestro mundo.",
          icon: "sword-cross",
        },
        {
          title: "Dios el Hijo",
          description:
            "Jesús es verdaderamente Dios, quien se hizo humano para vivir entre nosotros y reconciliarnos con el Padre.",
          icon: "crown",
        },
        {
          title: "Vida, Muerte y Resurrección de Cristo",
          description:
            "A través de la vida perfecta de Jesús y su sacrificio en la cruz, Él proporcionó el único camino para que seamos perdonados y restaurados.",
          icon: "heart",
        },
        {
          title: "Experiencia de la Salvación",
          description:
            "Por la fe en Jesús, somos adoptados en la familia de Dios y librados del poder de nuestros errores pasados.",
          icon: "gift",
        },
        {
          title: "Crecer en Cristo",
          description:
            "A través del Espíritu Santo, somos fortalecidos para vivir una vida de paz, crecimiento espiritual y servicio a los demás.",
          icon: "sprout",
        },
        {
          title: "El Sábado",
          description:
            "El sábado del séptimo día es un regalo semanal de Dios, un tiempo para el descanso, la adoración y la comunidad.",
          icon: "calendar-heart",
        },
        {
          title: "La Segunda Venida de Cristo",
          description:
            'El regreso de Jesús es nuestra "esperanza bienaventurada", marcando el día en que Él finalmente restaurará todas las cosas.',
          icon: "trumpet",
        },
        {
          title: "La Tierra Nueva",
          description:
            "Dios creará un hogar donde mora la justicia, y ya no habrá más dolor, sufrimiento ni muerte.",
          icon: "earth",
        },
      ],
      organization: "Organización de la Iglesia",
      localConference: "Asociación Local",
      localConfName: "Greater New York Conference",
      localConfDesc:
        "Nuestra congregación local es parte de una red de iglesias en el área metropolitana de Nueva York.",
      unionConference: "Unión",
      unionConfName: "Atlantic Union Conference",
      unionConfDesc:
        "La Unión del Atlántico coordina la misión y educación adventista en el noreste de los Estados Unidos y las Bermudas.",
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  return (
    <>
      <Stack.Screen options={{ title: labels.title }} />
      <ScrollView
        style={DocumentStyles.container}
        contentContainerStyle={{ paddingTop: headerHeight }}
      >
        <View style={styles.header}>
          <Image
            source={{ uri: CHURCH_BUILDING_IMAGE_URL }}
            style={styles.image}
            accessibilityLabel="Church banner"
          />
          <Text
            variant="titleLarge"
            style={[DocumentStyles.docTitle, { color: theme.colors.onSurface }]}
          >
            {CHURCH_NAME}
          </Text>
        </View>

        <View style={DocumentStyles.section}>
          <Text
            variant="titleLarge"
            style={[
              DocumentStyles.sectionTitle,
              {
                color: theme.colors.onSurface,
                borderBottomColor: theme.colors.outlineVariant,
              },
            ]}
          >
            {labels.aboutSDA}
          </Text>
          <Paragraph
            style={[
              DocumentStyles.description,
              { color: theme.colors.onSurface },
            ]}
          >
            {labels.sdaDescription}
          </Paragraph>
          <View style={styles.pillarContainer}>
            {(labels as any).pillarItems.map((item: any, index: number) => (
              <Card
                key={index}
                style={[
                  styles.pillarCard,
                  { borderWidth: 1, borderColor: theme.colors.outlineVariant },
                ]}
                mode="contained"
              >
                <View style={styles.pillarContent}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={DESIGN_TOKENS.ICON_SIZE_FEATURED}
                    color={theme.colors.tertiary}
                  />
                  <Text
                    variant="labelSmall"
                    style={[
                      styles.pillarText,
                      { color: theme.colors.onSurface },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {item.title}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </View>

        <View style={DocumentStyles.section}>
          <Text
            variant="titleLarge"
            style={[
              DocumentStyles.sectionTitle,
              {
                color: theme.colors.onSurface,
                borderBottomColor: theme.colors.outlineVariant,
              },
            ]}
          >
            {labels.history}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            {labels.historySubtext}
          </Text>
          <View style={styles.timelineContainer}>
            {(labels as any).milestoneItems.map((item: any, index: number) => (
              <View key={index} style={styles.timelineColumn}>
                <View
                  style={[
                    styles.yearCircle,
                    { backgroundColor: theme.colors.tertiary },
                  ]}
                >
                  <Text
                    style={[
                      styles.yearText,
                      { color: theme.colors.onTertiary },
                    ]}
                  >
                    {item.year}
                  </Text>
                </View>
                <View
                  style={[
                    styles.connectorLine,
                    { backgroundColor: theme.colors.outlineVariant },
                  ]}
                />
                <Text
                  variant="labelSmall"
                  style={[
                    styles.milestoneEvent,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {item.event}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={DocumentStyles.section}>
          <Text
            variant="titleLarge"
            style={[
              DocumentStyles.sectionTitle,
              {
                color: theme.colors.onSurface,
                borderBottomColor: theme.colors.outlineVariant,
              },
            ]}
          >
            {labels.beliefs}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtext, { color: theme.colors.onSurface }]}
          >
            {labels.beliefsSubtext}
          </Text>

          <View style={styles.cardContainer}>
            {labels.beliefsItems.map((item, index) => (
              <Card
                key={index}
                style={[
                  DocumentStyles.card,
                  { borderWidth: 1, borderColor: theme.colors.outlineVariant },
                ]}
                mode="contained"
              >
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={DESIGN_TOKENS.ICON_SIZE_STANDARD}
                    color={theme.colors.tertiary}
                  />
                  <Text
                    variant="titleMedium"
                    style={[
                      styles.cardTitleText,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {item.description}
                  </Text>
                </View>
              </Card>
            ))}
          </View>

          <Text
            variant="bodyMedium"
            style={[
              DocumentStyles.note,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {labels.beliefsNote}
          </Text>

          <Button
            mode="contained"
            onPress={openBeliefs}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            style={DocumentStyles.button}
            icon="open-in-new"
          >
            {labels.learnMore}
          </Button>
        </View>

        <View style={DocumentStyles.section}>
          <Text
            variant="titleLarge"
            style={[
              DocumentStyles.sectionTitle,
              {
                color: theme.colors.onSurface,
                borderBottomColor: theme.colors.outlineVariant,
              },
            ]}
          >
            {labels.organization}
          </Text>
          <Card style={styles.orgCard} mode="outlined">
            <Card.Content>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {labels.localConference}
              </Text>
              <Text
                variant="titleLarge"
                style={[styles.orgName, { color: theme.colors.onSurface }]}
              >
                {labels.localConfName}
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.orgDesc, { color: theme.colors.onSurface }]}
              >
                {labels.localConfDesc}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="open-in-new"
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
                onPress={openGNYC}
              >
                Learn More
              </Button>
            </Card.Actions>
          </Card>

          <Card style={styles.orgCard} mode="outlined">
            <Card.Content>
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {labels.unionConference}
              </Text>
              <Text
                variant="titleLarge"
                style={[styles.orgName, { color: theme.colors.onSurface }]}
              >
                {labels.unionConfName}
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.orgDesc, { color: theme.colors.onSurface }]}
              >
                {labels.unionConfDesc}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="open-in-new"
                buttonColor={theme.colors.primary}
                textColor={theme.colors.onPrimary}
                onPress={openAtlanticUnion}
              >
                Learn More
              </Button>
            </Card.Actions>
          </Card>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: 200,
  },
  subtext: {
    marginBottom: 12,
  },
  cardContainer: {
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  cardTitleText: {
    marginLeft: 12,
    fontWeight: "bold",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pillarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  pillarCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  pillarContent: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pillarText: {
    marginTop: 4,
    textAlign: "center",
    fontWeight: "600",
  },
  timelineContainer: {
    flexDirection: "row",
    marginTop: 24,
  },
  timelineColumn: {
    flex: 1,
    alignItems: "center",
  },
  yearCircle: {
    width: DESIGN_TOKENS.TIMELINE_CIRCLE_SIZE,
    height: DESIGN_TOKENS.TIMELINE_CIRCLE_SIZE,
    borderRadius: DESIGN_TOKENS.TIMELINE_CIRCLE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  yearText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  connectorLine: {
    width: 2,
    height: 30,
  },
  milestoneEvent: {
    textAlign: "center",
    marginTop: 4,
    fontSize: 10,
    paddingHorizontal: 2,
  },
  orgCard: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  orgName: {
    fontSize: 18,
    marginTop: 4,
  },
  orgDesc: {
    marginTop: 4,
  },
});
