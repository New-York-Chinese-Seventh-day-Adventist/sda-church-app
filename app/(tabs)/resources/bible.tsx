import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Divider, List, Modal, Portal, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import * as BibleService from '@/services/BibleService';
import { NavigationStyles } from '@/styles/NavigationStyles';

export default function BibleReaderScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  // Selection state
  const [translation, setTranslation] = useState(BibleService.SUPPORTED_TRANSLATIONS[0]);
  const [book, setBook] = useState<BibleService.TranslationBook | null>(null);
  const [chapterNum, setChapterNum] = useState(1);

  // Data state
  const [books, setBooks] = useState<BibleService.TranslationBook[]>([]);
  const [chapterData, setChapterData] =
    useState<BibleService.TranslationBookChapter | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [modalType, setModalType] = useState<'translation' | 'book' | 'chapter' | null>(
    null,
  );

  // Initial load: Fetch books for default translation
  // This effect loads the books for the selected translation and sets the current book.
  useEffect(() => {
    const loadBooksAndSetBook = async () => {
      try {
        const fetchedBooks = await BibleService.fetchBooks(translation.id);
        setBooks(fetchedBooks);

        // Determine the next book based on previous selection or default to Genesis
        setBook((prevBook) => {
          const matchingBook = fetchedBooks.find((b) => b.id === prevBook?.id);
          return (
            matchingBook || fetchedBooks.find((b) => b.id === 'GEN') || fetchedBooks[0]
          );
        });
      } catch (e) {
        console.error('Error loading books:', e);
      }
    };
    loadBooksAndSetBook();
  }, [book, translation]);

  // Load chapter content
  useEffect(() => {
    if (book) {
      const loadChapter = async () => {
        setLoading(true);
        try {
          const data = await BibleService.fetchChapter(
            translation.id,
            book.id,
            chapterNum,
          );
          setChapterData(data);
        } catch (e) {
          console.error('Error loading chapter:', e);
        } finally {
          setLoading(false);
        }
      };
      loadChapter();
    }
  }, [translation, book?.id, chapterNum]);

  const renderContent = (content: BibleService.ChapterContent, index: number) => {
    switch (content.type) {
      case 'heading':
        return (
          <Text key={index} style={[styles.heading, { color: theme.colors.primary }]}>
            {content.content.join(' ')}
          </Text>
        );
      case 'verse':
        return (
          <Text
            key={index}
            style={[styles.verseContainer, { color: theme.colors.onBackground }]}
          >
            <Text style={[styles.verseNumber, { color: theme.colors.outline }]}>
              {content.number}{' '}
            </Text>
            {content.content.map((item, i) => {
              if (typeof item === 'string') return <Text key={i}>{item}</Text>;
              if ('text' in item) {
                return (
                  <Text key={i} style={[item.poem !== undefined && styles.poemText]}>
                    {item.text}
                  </Text>
                );
              }
              if ('heading' in item) {
                return (
                  <Text key={i} style={styles.inlineHeading}>
                    {item.heading}
                  </Text>
                );
              }
              return null;
            })}
          </Text>
        );
      case 'line_break':
        return <View key={index} style={styles.lineBreak} />;
      default:
        return null;
    }
  };

  const closeModal = () => setModalType(null);

  return (
    <View style={NavigationStyles.container}>
      <Stack.Screen options={{ title: book ? `${book.name} ${chapterNum}` : 'Bible' }} />

      {/* Selector Bar */}
      <View
        style={[
          styles.selectorBar,
          {
            top: headerHeight,
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setModalType('translation')}
        >
          <Text
            numberOfLines={1}
            style={[styles.selectorText, { color: theme.colors.onSurface }]}
          >
            {translation.id}
          </Text>
        </TouchableOpacity>
        <Divider style={styles.verticalDivider} />
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setModalType('book')}
        >
          <Text
            numberOfLines={1}
            style={[styles.selectorText, { color: theme.colors.onSurface }]}
          >
            {book?.name || '...'}
          </Text>
        </TouchableOpacity>
        <Divider style={styles.verticalDivider} />
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setModalType('chapter')}
        >
          <Text style={[styles.selectorText, { color: theme.colors.onSurface }]}>
            {chapterNum}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + 60, paddingBottom: insets.bottom + 40 },
        ]}
      >
        {loading ? (
          <ActivityIndicator style={styles.loader} color={theme.colors.primary} />
        ) : (
          chapterData?.chapter.content.map((c, i) => renderContent(c, i))
        )}
      </ScrollView>

      {/* Selection Modals */}
      <Portal>
        <Modal
          visible={!!modalType}
          onDismiss={closeModal}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.modalInner}>
            <Text
              variant="titleLarge"
              style={[styles.modalTitle, { color: theme.colors.onSurface }]}
            >
              {modalType === 'translation'
                ? 'Translation'
                : modalType === 'book'
                  ? 'Book'
                  : 'Chapter'}
            </Text>
            <Divider />
            <FlatList
              data={
                modalType === 'translation'
                  ? BibleService.SUPPORTED_TRANSLATIONS
                  : modalType === 'book'
                    ? books
                    : Array.from({ length: book?.numberOfChapters || 0 }, (_, i) => i + 1)
              }
              keyExtractor={(item) =>
                typeof item === 'object' ? item.id : item.toString()
              }
              renderItem={({ item }) => (
                <List.Item
                  title={typeof item === 'object' ? item.name : `Chapter ${item}`}
                  description={
                    typeof item === 'object' && 'lang' in item ? item.lang : undefined
                  }
                  onPress={() => {
                    if (modalType === 'translation') setTranslation(item as any);
                    if (modalType === 'book') setBook(item as any);
                    if (modalType === 'chapter') setChapterNum(item as any);
                    closeModal();
                  }}
                  titleStyle={
                    (modalType === 'translation' && item.id === translation.id) ||
                    (modalType === 'book' && item.id === book?.id) ||
                    (modalType === 'chapter' && item === chapterNum)
                      ? { color: theme.colors.primary, fontWeight: 'bold' }
                      : { color: theme.colors.onSurface }
                  }
                />
              )}
            />
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectorButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  verticalDivider: {
    width: 1,
    height: '60%',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 50,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  verseContainer: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 12,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  inlineHeading: {
    fontWeight: '700',
    marginTop: 8,
    display: 'flex',
  },
  lineBreak: {
    height: 16,
  },
  poemText: {
    fontStyle: 'italic',
  },
  modalContent: {
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalInner: {
    paddingVertical: 16,
    flexShrink: 1,
  },
  modalTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
});
