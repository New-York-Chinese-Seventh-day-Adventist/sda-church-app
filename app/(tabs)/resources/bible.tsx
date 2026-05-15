import { Stack } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
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

import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import * as BibleService from '@/services/BibleService';
import { NavigationStyles } from '@/styles/NavigationStyles';

const uiLabels = {
  en: {
    translation: 'Translation',
    book: 'Book',
    chapter: 'Chapter',
    chapterItem: 'Chapter {n}',
    bible: 'Bible',
  },
  zh: {
    translation: '譯本',
    book: '書卷',
    chapter: '章節',
    chapterItem: '第 {n} 章',
    bible: '聖經',
  },
  'zh-cn': {
    translation: '译本',
    book: '书卷',
    chapter: '章节',
    chapterItem: '第 {n} 章',
    bible: '圣经',
  },
  es: {
    translation: 'Traducción',
    book: 'Libro',
    chapter: 'Capítulo',
    chapterItem: 'Capítulo {n}',
    bible: 'Biblia',
  },
};

export default function BibleReaderScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { language } = useContext(LanguageContext);
  const labels = uiLabels[language as keyof typeof uiLabels] || uiLabels.en;
  const scrollRef = useRef<ScrollView>(null);
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  // Selection state
  const [supportedTranslation, setSupportedTranslation] = useState(() => {
    const defaultId = BibleService.DEFAULT_TRANSLATION_MAP[language] || 'BSB';
    return (
      BibleService.SUPPORTED_TRANSLATIONS.find((t) => t.id === defaultId) ||
      BibleService.SUPPORTED_TRANSLATIONS[0]
    );
  });
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
        const fetchedBooks = await BibleService.fetchBooks(supportedTranslation.id);
        setBooks(fetchedBooks);

        // Determine the next book based on previous selection or default to Genesis
        setBook((prevBook) => {
          const matchingBook = fetchedBooks.find(
            (b: BibleService.TranslationBook) => b.id === prevBook?.id,
          );

          if (matchingBook) {
            // If the book exists in the new translation, try to preserve the chapter.
            // We clamp it to 1 if the current number exceeds the new book's chapter count.
            setChapterNum((prev) => (prev > matchingBook.numberOfChapters ? 1 : prev));
            return matchingBook;
          }

          // If the book doesn't exist in the new translation, fallback to Genesis or the first book.
          // Since this is effectively a "new" book selection, we reset chapter to 1.
          setChapterNum(1);
          return (
            fetchedBooks.find((b: BibleService.TranslationBook) => b.id === 'GEN') ||
            fetchedBooks[0] ||
            null
          );
        });
      } catch (e) {
        console.error('Error loading books:', e);
      }
    };
    loadBooksAndSetBook();
  }, [supportedTranslation.id]);

  // Load chapter content
  useEffect(() => {
    // Only fetch if we have a book and that book belongs to the current translation's book list
    // This prevents "stale" fetches when switching translations where the book IDs might differ.
    const isBookValidForTranslation = books.some(
      (b: BibleService.TranslationBook) => b.id === book?.id,
    );

    if (book && isBookValidForTranslation) {
      const loadChapter = async () => {
        setLoading(true);
        setChapterData(null); // Clear old content immediately
        try {
          const data = await BibleService.fetchChapter(
            supportedTranslation.id,
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
  }, [supportedTranslation.id, book?.id, chapterNum, books]);

  // Scroll to top when chapter content changes
  useEffect(() => {
    if (chapterData) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [chapterData]);

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
      <Stack.Screen
        options={{ title: book ? `${book.name} ${chapterNum}` : labels.bible }}
      />

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
            {supportedTranslation.name}
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
        ref={scrollRef}
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
                ? labels.translation
                : modalType === 'book'
                  ? labels.book
                  : labels.chapter}
            </Text>
            <Divider />
            <FlatList<
              | (typeof BibleService.SUPPORTED_TRANSLATIONS)[number]
              | BibleService.TranslationBook
              | number
            >
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
                  title={
                    typeof item === 'object'
                      ? item.name
                      : labels.chapterItem.replace('{n}', item.toString())
                  }
                  description={
                    typeof item === 'object' && 'lang' in item ? item.lang : undefined
                  }
                  onPress={() => {
                    if (modalType === 'translation') {
                      setSupportedTranslation(item as any);
                    } else if (modalType === 'book') {
                      setBook(item as any);
                      setChapterNum(1);
                    } else if (modalType === 'chapter') {
                      setChapterNum(item as any);
                    }
                    closeModal();
                  }}
                  titleStyle={
                    (modalType === 'translation' &&
                      typeof item === 'object' &&
                      item.id === supportedTranslation.id) ||
                    (modalType === 'book' &&
                      typeof item === 'object' &&
                      item.id === book?.id) ||
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
