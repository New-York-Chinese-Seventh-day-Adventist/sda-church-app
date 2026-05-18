import {
  CHURCH_BUILDING_IMAGE_URL,
  openAtlanticUnion,
  openGNYC,
} from '@/constants/ExternalLinks';
import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { DocumentStyles } from '@/styles/DocumentStyles';
import { Stack } from 'expo-router';
import { useContext } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AboutChurchHistoryScreen() {
  const { language } = useContext(LanguageContext);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const allLabels = {
    en: {
      title: 'Our History',
      churchName: 'New York Chinese Seventh-day Adventist Church',
      history: 'Our History',
      historySubtext:
        'The New York Chinese Seventh-day Adventist Church began as a humble gathering in 1973. Today, we are a vibrant community dedicated to outreach and supporting our neighbors.',
      milestoneItems: [
        { year: '1973', event: 'First home gathering' },
        { year: '1987', event: 'Officially organized' },
        { year: '1996', event: 'Joined conference' },
        { year: '1999', event: 'Opened permanent home' },
      ],
      locationsTitle: 'Our Locations & Services',
      elmhurstHeader: 'Elmhurst Primary Location',
      elmhurstText:
        'Church services are conducted in both English and Mandarin Chinese. We are blessed to have a vibrant, multiethnic congregation. Our members come from various backgrounds, and speak many languages, including Spanish, French, German, Japanese, and more.',
      flushingHeader: 'Flushing Fellowship',
      flushingText:
        'A subgroup of our Elmhurst location where we supply meals and foster community.',
      brooklynHeader: 'Brooklyn Branch Church',
      brooklynText:
        'In Bay Ridge, Brooklyn, we hold a traditional worship service on Sabbaths on the 3rd floor of the Iglesia Adventista del Séptimo Día de Bay Ridge at 5318 4th Avenue, Brooklyn, NY 11220, accessible by the R train. This service is conducted in Mandarin and includes prayer, song service, a sermon, and offerings, providing a unique opportunity for spiritual growth and fellowship.',
      organization: 'Affiliations',
      localConference: 'Local Conference',
      localConfName: 'Greater New York Conference',
      localConfDesc:
        'Our local congregation is part of a network of churches across the New York metropolitan area.',
      unionConference: 'Union Conference',
      unionConfName: 'Atlantic Union Conference',
      unionConfDesc:
        'The Atlantic Union coordinates Adventist mission and education across the Northeast United States and Bermuda.',
    },
    zh: {
      title: '我們的歷史',
      churchName: '紐約華人基督復臨安息日會',
      history: '我們的歷史',
      historySubtext:
        '紐約華人基督復臨安息日會始於 1973 年。今天, 我們是一個充滿活力的雙語社群, 始終致力於外展使命並支持鄰居。',
      milestoneItems: [
        { year: '1973', event: '首次住宅聚會' },
        { year: '1987', event: '會眾正式成立' },
        { year: '1996', event: '加入紐約區會' },
        { year: '1999', event: '永久會所落成' },
      ],
      locationsTitle: '聚會地點與服務',
      elmhurstHeader: '艾姆赫斯特母會',
      elmhurstText:
        '聚會以英語和國語進行。我們擁有一個充滿活力的多民族會眾。我們的成員來自不同的背景，說多種語言，包括西班牙語、法語、德語、日語等。',
      flushingHeader: '法拉盛團契',
      flushingText: '艾姆赫斯特教會的子小組，我們在那裡提供餐點並建立社群聯結。',
      brooklynHeader: '布魯克林分會',
      brooklynText:
        '在布魯克林的 Bay Ridge，我們在安息日於 5318 4th Avenue, Brooklyn, NY 11220 的 Iglesia Adventista del Séptimo Día de Bay Ridge 三樓舉行傳統崇拜服務，可搭乘 R 線地鐵抵達。該服務以國語進行，包括禱告、詩歌讚美、證道和奉獻，為靈命成長和團契提供獨特機會。',
      organization: '教會組織',
      localConference: '區會',
      localConfName: '大紐約區會',
      localConfDesc: '我們的在地會眾是大紐約大都會地區教會網絡的一部分。',
      unionConference: '聯合會',
      unionConfName: '大西洋聯合會',
      unionConfDesc: '大西洋聯合會負責協調美國東北部和百慕達地區的復臨教會使命與教育。',
    },
    'zh-cn': {
      title: '我们的历史',
      churchName: '纽约华人基督复临安息日会',
      history: '我们的历史',
      historySubtext:
        '纽约华人基督复临安息日会始于 1973 年。今天, 我们是一个充满活力的双语社群, 始终致力于外展使命并支持邻居。',
      milestoneItems: [
        { year: '1973', event: '首次住宅聚会' },
        { year: '1987', event: '会众正式成立' },
        { year: '1996', event: '加入纽约区会' },
        { year: '1999', event: '永久会所落成' },
      ],
      locationsTitle: '聚会地点与服务',
      elmhurstHeader: '艾姆赫斯特母会',
      elmhurstText:
        '聚会以英语和普通话进行。我们拥有一个充满活力的多民族会众。我们的成员来自不同的背景，说多种语言，包括西班牙语、法语、德语、日语等。',
      flushingHeader: '法拉盛团契',
      flushingText: '艾姆赫斯特教会的子小组，我们在那里提供餐点并建立社区联结。',
      brooklynHeader: '布鲁克林分会',
      brooklynText:
        '在布鲁克林的 Bay Ridge，我们在安息日于 5318 4th Avenue, Brooklyn, NY 11220 的 Iglesia Adventista del Séptimo Día de Bay Ridge 三楼举行传统崇拜服务，可搭乘 R 线地铁抵达。该服务以普通话进行，包括祷告、诗歌赞美、证道和奉献，为灵命成长和团契提供独特机会。',
      organization: '教会组织',
      localConference: '区会',
      localConfName: '大纽约区会',
      localConfDesc: '我们的在地会众是大纽约大都会地区教会网络的一部分。',
      unionConference: '联合会',
      unionConfName: '大西洋联合会',
      unionConfDesc: '大西洋联合会负责协调美国东北部和百慕大地区的复临教会使命与教育。',
    },
    es: {
      title: 'Nuestra Historia',
      churchName: 'Iglesia Adventista del Séptimo Día de Nueva York',
      history: 'Nuestra Historia',
      historySubtext:
        'La Iglesia Adventista del Séptimo Día de Nueva York comenzó como una humilde reunión en 1973. Hoy, somos una comunidad bilingüe vibrante dedicada a apoyar a nuestros vecinos.',
      milestoneItems: [
        { year: '1973', event: 'Primera reunión' },
        { year: '1987', event: 'Organizada' },
        { year: '1996', event: 'Unión a conferencia' },
        { year: '1999', event: 'Sede propia' },
      ],
      locationsTitle: 'Nuestras Ubicaciones y Servicios',
      elmhurstHeader: 'Sede Principal de Elmhurst',
      elmhurstText:
        'Los servicios de la iglesia se llevan a cabo tanto en inglés como en chino mandarín. Tenemos la bendición de tener una congregación multiétnica vibrante. Nuestros miembros provienen de diversos orígenes y hablan muchos idiomas, incluidos español, francés, alemán, japonés y más.',
      flushingHeader: 'Compañerismo de Flushing',
      flushingText:
        'Un subgrupo de nuestra ubicación de Elmhurst donde proporcionamos comidas y fomentamos la comunidad.',
      brooklynHeader: 'Sucursal de Brooklyn',
      brooklynText:
        'En Bay Ridge, Brooklyn, llevamos a cabo un servicio de adoración tradicional los sábados en el tercer piso de la Iglesia Adventista del Séptimo Día de Bay Ridge en 5318 4th Avenue, Brooklyn, NY 11220, accesible por el tren R. Este servicio se realiza en mandarín e incluye oración, servicio de cantos, un sermón y ofrendas, brindando una oportunidad única para el crecimiento espiritual y el compañerismo.',
      organization: 'Organización de la Iglesia',
      localConference: 'Asociación Local',
      localConfName: 'Greater New York Conference',
      localConfDesc:
        'Nuestra congregación local es parte de una red de iglesias en el área metropolitana de Nueva York.',
      unionConference: 'Unión',
      unionConfName: 'Atlantic Union Conference',
      unionConfDesc:
        'La Unión del Atlántico coordina la misión y educación adventista en el noreste de los Estados Unidos y las Bermudas.',
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
            {labels.churchName}
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
            {labels.history}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
            {labels.historySubtext}
          </Text>
          <View style={styles.timelineContainer}>
            {(labels as any).milestoneItems.map((item: any, index: number) => (
              <View key={index} style={styles.timelineColumn}>
                <View
                  style={[styles.yearCircle, { backgroundColor: theme.colors.tertiary }]}
                >
                  <Text style={[styles.yearText, { color: theme.colors.onTertiary }]}>
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
            {labels.locationsTitle}
          </Text>

          <View style={{ marginBottom: 24 }}>
            <Text
              variant="titleMedium"
              style={{
                color: theme.colors.primary,
                fontWeight: 'bold',
                marginBottom: 4,
              }}
            >
              {labels.elmhurstHeader}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurface, marginBottom: 12 }}
            >
              {labels.elmhurstText}
            </Text>

            <View
              style={{
                marginLeft: 16,
                paddingLeft: 12,
                borderLeftWidth: 2,
                borderLeftColor: theme.colors.outlineVariant,
              }}
            >
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.secondary, fontWeight: 'bold' }}
              >
                {labels.flushingHeader}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {labels.flushingText}
              </Text>
            </View>
          </View>

          <View>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.primary, fontWeight: 'bold', marginBottom: 4 }}
            >
              {labels.brooklynHeader}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              {labels.brooklynText}
            </Text>
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
    width: '100%',
    height: 200,
  },
  timelineContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  timelineColumn: {
    flex: 1,
    alignItems: 'center',
  },
  yearCircle: {
    width: DESIGN_TOKENS.TIMELINE_CIRCLE_SIZE,
    height: DESIGN_TOKENS.TIMELINE_CIRCLE_SIZE,
    borderRadius: DESIGN_TOKENS.TIMELINE_CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  connectorLine: {
    width: 2,
    height: 30,
  },
  milestoneEvent: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 10,
    paddingHorizontal: 2,
  },
  orgCard: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  orgName: {
    fontSize: 18,
    marginTop: 4,
  },
  orgDesc: {
    marginTop: 4,
  },
});
