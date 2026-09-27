import { MenuCard } from '@/components/MenuCard';
import { TitleHero } from '@/components/TitleHero';
import { CHURCH_BUILDING_IMAGE_URL } from '@/constants/ExternalLinks';
import { LanguageContext } from '@/constants/LanguageContext';
import { useAppTheme } from '@/constants/Themes';
import { useDocumentStyles } from '@/styles/DocumentStyles';
import { useNavigationStyles } from '@/styles/NavigationStyles';
import { EGW_BOOKS } from '@/features/library/EgwBookCatalog';
import {
  getLibraryItemDisplayText,
  getLibraryItemShelf,
  getLibraryItemsForLanguage,
} from '@/features/library/LibraryCatalog';
import { router, Stack } from 'expo-router';
import { useCallback, useContext, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Text } from 'react-native-paper';

const copy = {
  en: { title: 'Library', pioneers: 'Church Pioneers', readers: 'Youth & Children', topics: 'Topics', egw: 'Ellen G. White', egwSub: 'Books and multilingual official editions', bates: 'Joseph Bates', batesSub: 'Sabbath and early Adventist writings', andrews: 'J. N. Andrews', andrewsSub: 'History and early Adventist scholarship', smith: 'Uriah Smith', smithSub: 'Prophecy and early Adventist teaching', youth: 'Youth / Young Adults', youthSub: 'A small starter shelf for growing faith', children: 'Children', childrenSub: 'A small starter shelf of Christ-centered stories', ministry: 'Ministry', ministrySub: 'Pastoral service, health, and mission', family: 'Family & Education', familySub: 'Home, character, and Christian education', classics: 'Christian Classics', classicsSub: 'Enduring Christian devotional literature' },
  zh: { title: '圖書館', pioneers: '教會先驅', readers: '青年與兒童', topics: '主題', egw: '懷愛倫', egwSub: '著作及官方多語版本', bates: '約瑟·貝茨', batesSub: '安息日與早期復臨著作', andrews: '約翰·安德烈斯', andrewsSub: '歷史與早期復臨研究', smith: '烏利亞·史密斯', smithSub: '預言與早期復臨教導', youth: '青年／青年成人', youthSub: '精選的信仰成長起步書架', children: '兒童', childrenSub: '精選的基督中心故事', ministry: '事工', ministrySub: '牧養服務、健康與宣教', family: '家庭與教育', familySub: '家庭、品格與基督化教育', classics: '基督教經典', classicsSub: '歷久彌新的基督教靈修著作' },
  'zh-cn': { title: '图书馆', pioneers: '教会先驱', readers: '青年与儿童', topics: '主题', egw: '怀爱伦', egwSub: '著作及官方多语版本', bates: '约瑟·贝茨', batesSub: '安息日与早期复临著作', andrews: '约翰·安德烈斯', andrewsSub: '历史与早期复临研究', smith: '乌利亚·史密斯', smithSub: '预言与早期复临教导', youth: '青年／青年成人', youthSub: '精选的信仰成长起步书架', children: '儿童', childrenSub: '精选的基督中心故事', ministry: '事工', ministrySub: '牧养服务、健康与宣教', family: '家庭与教育', familySub: '家庭、品格与基督化教育', classics: '基督教经典', classicsSub: '历久弥新的基督教灵修著作' },
  es: { title: 'Biblioteca', pioneers: 'Pioneros de la iglesia', readers: 'Jóvenes y niños', topics: 'Temas', egw: 'Elena G. de White', egwSub: 'Libros y ediciones oficiales multilingües', bates: 'Joseph Bates', batesSub: 'El sábado y los primeros escritos adventistas', andrews: 'J. N. Andrews', andrewsSub: 'Historia y estudios adventistas tempranos', smith: 'Uriah Smith', smithSub: 'Profecía y enseñanza adventista temprana', youth: 'Jóvenes / Adultos jóvenes', youthSub: 'Una pequeña selección para crecer en la fe', children: 'Niños', childrenSub: 'Una pequeña selección de historias sobre Cristo', ministry: 'Ministerio', ministrySub: 'Servicio pastoral, salud y misión', family: 'Familia y educación', familySub: 'Hogar, carácter y educación cristiana', classics: 'Clásicos cristianos', classicsSub: 'Literatura devocional cristiana perdurable' },
} as const;

const searchLabels = {
  en: 'Search all library books',
  zh: '搜尋所有圖書',
  'zh-cn': '搜索所有图书',
  es: 'Buscar todos los libros',
} as const;

export default function LibraryHubScreen() {
  const { language } = useContext(LanguageContext);
  const labels = copy[language] || copy.en;
  const theme = useAppTheme();
  const navigationStyles = useNavigationStyles();
  const documentStyles = useDocumentStyles();
  const catalog = getLibraryItemsForLanguage(language);
  const open = useCallback((collection: string, q?: string) =>
    router.push({
      pathname: '/explore/library/[collection]',
      params: { collection, ...(q ? { q } : {}) },
    } as any), []);
  const searchItems = useMemo(() => {
    const egw = EGW_BOOKS.map((work) => ({
      collection: 'egw' as const,
      icon: 'book-open-page-variant',
      key: `egw:${work.id}`,
      onPress: () => open('egw', work.workTitle[language]),
      searchText: `${work.workTitle[language]} ${labels.egw}`,
      subtitle: labels.egw,
      title: work.workTitle[language],
    }));
    const other = [
      ...catalog.publicDomainWorks,
      ...catalog.officialCollections,
      ...catalog.churchDocuments,
    ].map(
      (work) => {
        const text = getLibraryItemDisplayText(work, language);
        const collection = getLibraryItemShelf(work);
        return {
          collection,
          icon: 'book-open-page-variant',
          key: `${collection}:${work.id}`,
          onPress: () => open(collection, text.title),
          searchText: `${text.title} ${text.author}`,
          subtitle: text.author,
          title: text.title,
        };
      },
    );
    return [...egw, ...other];
  }, [catalog.churchDocuments, catalog.officialCollections, catalog.publicDomainWorks, labels.egw, language, open]);
  return (
    <>
      <Stack.Screen
        options={{
          title: labels.title,
          headerSearch: {
            items: searchItems,
            placeholder: searchLabels[language],
          },
        } as any}
      />
      <ScrollView
        style={navigationStyles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* The compact banner matches each shelf's page and leaves room for
            the shelves themselves; the hub no longer shows a verse. */}
        <TitleHero
          imageSource={{ uri: CHURCH_BUILDING_IMAGE_URL }}
          title={labels.title}
        />
        <View style={styles.content}>
        {/* Topics come first so visitors meet the general Christian shelves before
            the Adventist pioneers. */}
        <List.Section>
          <Text
            variant="titleLarge"
            style={[
              documentStyles.sectionTitle,
              {
                color: theme.colors.onSurface,
                borderBottomColor: theme.colors.outlineVariant,
              },
            ]}
          >
            {labels.topics}
          </Text>
          <MenuCard title={labels.classics} description={labels.classicsSub} icon="book-cross" onPress={() => open('classics')} />
          <MenuCard title={labels.ministry} description={labels.ministrySub} icon="hand-heart" onPress={() => open('ministry')} />
          <MenuCard title={labels.family} description={labels.familySub} icon="home-heart" onPress={() => open('family')} />
        </List.Section>
        <List.Section>
          <Text
            variant="titleLarge"
            style={[
              documentStyles.sectionTitle,
              {
                color: theme.colors.onSurface,
                borderBottomColor: theme.colors.outlineVariant,
              },
            ]}
          >
            {labels.pioneers}
          </Text>
          <MenuCard title={labels.egw} description={labels.egwSub} icon="bookshelf" onPress={() => open('egw')} />
          <MenuCard title={labels.bates} description={labels.batesSub} icon="book-open-variant" onPress={() => open('bates')} />
          <MenuCard title={labels.andrews} description={labels.andrewsSub} icon="history" onPress={() => open('andrews')} />
          <MenuCard title={labels.smith} description={labels.smithSub} icon="script-text-outline" onPress={() => open('smith')} />
        </List.Section>
        <List.Section>
          <Text
            variant="titleLarge"
            style={[
              documentStyles.sectionTitle,
              {
                color: theme.colors.onSurface,
                borderBottomColor: theme.colors.outlineVariant,
              },
            ]}
          >
            {labels.readers}
          </Text>
          <MenuCard title={labels.youth} description={labels.youthSub} icon="account-group" onPress={() => open('youth')} />
          <MenuCard title={labels.children} description={labels.childrenSub} icon="account-child" onPress={() => open('children')} />
        </List.Section>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  content: { paddingBottom: 24, paddingHorizontal: 20 },
});
