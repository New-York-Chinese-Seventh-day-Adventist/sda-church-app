import { MenuCard } from '@/components/MenuCard';
import { Stack } from 'expo-router';
import { useContext, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getSortedHymns, HydratedHymn, openHymnal } from '@/constants/Hymnal';
import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { NavigationStyles } from '@/styles/NavigationStyles';

const uiLabels = {
  en: {
    title: 'English Hymnal',
    search: 'Search by number or title...',
    copyrighted: 'Copyright Protected (Lyrics/Scan restricted)',
    externalLink: 'View on Hymnary.org',
  },
  zh: {
    title: '英文詩歌本',
    search: '按編號或標題搜尋...',
    copyrighted: '受版權保護 (歌詞/掃描受限)',
    externalLink: '在 Hymnary.org 查看',
  },
  'zh-cn': {
    title: '英文诗歌本',
    search: '按编号或标题搜索...',
    copyrighted: '受版权保护 (歌词/扫描受限)',
    externalLink: '在 Hymnary.org 查看',
  },
  es: {
    title: 'Himnario en Inglés',
    search: 'Buscar por número o título...',
    copyrighted: 'Protegido por derechos de autor',
    externalLink: 'Ver en Hymnary.org',
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
    const isCopyrighted = !item.hasLyricsOrScan;

    return (
      <View style={{ opacity: isCopyrighted ? 0.5 : 1 }}>
        <MenuCard
          title={`${item.number}. ${item.title}`}
          description={
            isCopyrighted
              ? labels.copyrighted
              : item.scriptureReference
                ? `${labels.externalLink} • ${item.scriptureReference}`
                : labels.externalLink
          }
          icon={isCopyrighted ? 'lock-outline' : 'music-note'}
          iconColor={isCopyrighted ? theme.colors.outline : theme.colors.primary}
          rightIcon={isCopyrighted ? undefined : 'open-in-new'}
          onPress={isCopyrighted ? undefined : () => openHymnal(item.number)}
        />
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
  searchbar: {
    borderRadius: 8,
  },
});
