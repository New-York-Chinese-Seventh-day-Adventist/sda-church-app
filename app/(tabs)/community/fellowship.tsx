import { MenuCard } from '@/components/MenuCard';
import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { DocumentStyles } from '@/styles/DocumentStyles';
import { Stack } from 'expo-router';
import { useContext } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const allLabels = {
  en: {
    title: 'Flushing Fellowship',
    description:
      'A subgroup of our Elmhurst location where we foster community. This includes meals, personal testimony, a lesson/sermon, prayer, and worship.',
    scheduleHeader: 'Weekly Meeting',
    thursday: 'Thursday',
    basement: 'Basement',
    dinner: 'Dinner & Devotion',
  },
  zh: {
    title: '法拉盛團契',
    description:
      '艾姆赫斯特教會的子小組，我們在那裡建立社群。聚會內容包括用餐、個人見證、講道、禱告和敬拜。',
    scheduleHeader: '每週聚會',
    thursday: '星期四',
    basement: '地下室',
    dinner: '晚餐與靈修',
  },
  'zh-cn': {
    title: '法拉盛团契',
    description:
      '艾姆赫斯特教会的小组，我们在那里建立社区。聚会内容包括用餐、个人见证、讲道、祷告和敬拜。',
    scheduleHeader: '每周聚会',
    thursday: '星期四',
    basement: '地下室',
    dinner: '晚餐与灵修',
  },
  es: {
    title: 'Compañerismo en Flushing',
    description:
      'Un subgrupo de nuestra ubicación de Elmhurst donde fomentamos la comunidad. Esto incluye comidas, testimonios personales, una lección/sermón, oración y adoración.',
    scheduleHeader: 'Reunión Semanal',
    thursday: 'Jueves',
    basement: 'Sótano',
    dinner: 'Cena y Devoción',
  },
};

export default function FlushingFellowshipScreen() {
  const theme = useAppTheme();
  const { language } = useContext(LanguageContext);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;
  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  return (
    <>
      <Stack.Screen options={{ title: labels.title }} />
      <ScrollView
        style={DocumentStyles.container}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 40 }}
      >
        <View style={DocumentStyles.section}>
          <Text
            variant="headlineSmall"
            style={[DocumentStyles.docTitle, { color: theme.colors.onSurface }]}
          >
            {labels.title}
          </Text>
          <Text
            variant="bodyMedium"
            style={[DocumentStyles.description, { color: theme.colors.onSurface }]}
          >
            {labels.description}
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
            {labels.scheduleHeader}
          </Text>
          <MenuCard
            title={labels.dinner}
            description={`${labels.thursday}, 6:30 - 8:00 PM • ${labels.basement}`}
            icon="silverware-fork-knife"
            iconColor={theme.colors.secondary}
            rightIcon={null}
          />
        </View>
      </ScrollView>
    </>
  );
}
