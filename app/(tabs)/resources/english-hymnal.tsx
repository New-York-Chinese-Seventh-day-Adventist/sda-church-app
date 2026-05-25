import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useContext, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Divider, Searchbar, Text, TouchableRipple } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getSortedHymns, HydratedHymn, openHymnal } from '@/constants/EnglishHymnal';
import { openYouTubeSearch } from '@/constants/ExternalLinks';
import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { NavigationStyles } from '@/styles/NavigationStyles';

const uiLabels = {
  en: {
    title: 'English Hymnal',
    search: 'Search by number or title...',
    externalLink: 'View on HymnsForWorship.org',
    legalNotice: 'Why are some hymns restricted?',
    legalLink: 'Legal Information',
    attribution: 'Hymn lyrics and sheet music are provided by HymnsForWorship.org.',
    watchYouTube: 'Sing on YouTube',
  },
  zh: {
    title: '英文詩歌本',
    search: '按編號或標題搜尋...',
    externalLink: '在 HymnsForWorship.org 查看',
    legalNotice: '為什麼有些詩歌受到限制？',
    legalLink: '法律資訊',
    attribution: '詩歌歌詞與琴譜由 HymnsForWorship.org 提供。',
    watchYouTube: '在 YouTube 上歌唱',
  },
  'zh-cn': {
    title: '英文诗歌本',
    search: '按编号或标题搜索...',
    externalLink: '在 HymnsForWorship.org 查看',
    legalNotice: '为什么有些诗歌受到限制？',
    legalLink: '法律信息',
    attribution: '诗歌歌词与琴谱由 HymnsForWorship.org 提供。',
    watchYouTube: '在 YouTube 上歌唱',
  },
  es: {
    title: 'Himnario en Inglés',
    search: 'Buscar por número o título...',
    externalLink: 'Ver en HymnsForWorship.org',
    legalNotice: '¿Por qué algunos himnos están restringidos?',
    legalLink: 'Información legal',
    attribution:
      'Las letras y partituras de los himnos son proporcionados por HymnsForWorship.org.',
    watchYouTube: 'Cantar en YouTube',
  },
};

export default function HymnalScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { language } = useContext(LanguageContext);
  const labels = uiLabels[language as keyof typeof uiLabels] || uiLabels.en;

  const [searchQuery, setSearchQuery] = useState('');
  const allHymns = useMemo(() => getSortedHymns('en'), []);

  const filteredHymns = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return allHymns;

    return allHymns.filter(
      (h) => h.number.toString().includes(query) || h.title.toLowerCase().includes(query),
    );
  }, [searchQuery, allHymns]);

  const renderHymnItem = ({ item }: { item: HydratedHymn }) => {
    return (
      <View
        style={[
          styles.hymnCardContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
          },
        ]}
      >
        {/* Top Section: Link to Sheet Music Website */}
        <TouchableRipple
          onPress={() => openHymnal(item.number)}
          style={styles.topSection}
        >
          <View style={styles.cardContent}>
            <MaterialCommunityIcons
              name="music-note"
              size={DESIGN_TOKENS.ICON_SIZE_FEATURED}
              color={theme.colors.tertiary}
              style={styles.leadingIcon}
            />
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
                {item.number}. {item.title}
              </Text>
              {item.scriptureReference && (
                <Text
                  style={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}
                >
                  {item.scriptureReference}
                </Text>
              )}
            </View>
            <MaterialCommunityIcons
              name="open-in-new"
              size={DESIGN_TOKENS.ICON_SIZE_STANDARD}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        </TouchableRipple>

        <Divider />

        {/* Bottom Section: YouTube Search */}
        <TouchableRipple
          onPress={() => openYouTubeSearch(`SDA Hymnal 1985 ${item.title}`)}
          style={styles.bottomSection}
        >
          <View style={styles.youtubeButtonContent}>
            <MaterialCommunityIcons
              name="youtube"
              size={24}
              color={(theme.colors as any).brandYoutube}
            />
            <Text
              style={[
                styles.youtubeButtonText,
                { color: (theme.colors as any).brandYoutube },
              ]}
            >
              {labels.watchYouTube}
            </Text>
          </View>
        </TouchableRipple>
      </View>
    );
  };

  return (
    <View style={NavigationStyles.container}>
      <Stack.Screen options={{ title: labels.title }} />

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE + 8 },
        ]}
      >
        <Searchbar
          placeholder={labels.search}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: theme.colors.surfaceVariant }]}
          elevation={0}
        />
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/you/legal',
              params: { backTo: '/resources/english-hymnal' },
            } as any)
          }
          style={styles.legalNotice}
        >
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {labels.legalNotice}{' '}
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              {labels.legalLink}
            </Text>
          </Text>
        </TouchableOpacity>
        <Text
          variant="bodySmall"
          style={[styles.attributionText, { color: theme.colors.onSurfaceVariant }]}
        >
          {labels.attribution}
        </Text>
      </View>

      <FlatList
        data={filteredHymns}
        keyExtractor={(item) => item.number.toString()}
        renderItem={renderHymnItem}
        contentContainerStyle={[
          NavigationStyles.contentContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  hymnCardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  topSection: {
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  leadingIcon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  bottomSection: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  youtubeButtonText: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 15,
  },
  searchbar: {
    borderRadius: 8,
  },
  legalNotice: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  attributionText: {
    marginTop: 4,
    paddingHorizontal: 4,
    opacity: 0.8,
  },
});
