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
    footnote: 'Footnote',
    hebrewSubtitle: 'Hebrew (Original)',
  },
  zh: {
    translation: '譯本',
    book: '書卷',
    chapter: '章節',
    chapterItem: '第 {n} 章',
    bible: '聖經',
    footnote: '腳注',
    hebrewSubtitle: '希伯來語 (原文)',
  },
  'zh-cn': {
    translation: '译本',
    book: '书卷',
    chapter: '章节',
    chapterItem: '第 {n} 章',
    bible: '圣经',
    footnote: '脚注',
    hebrewSubtitle: '希伯来语 (原文)',
  },
  es: {
    translation: 'Traducción',
    book: 'Libro',
    chapter: 'Capítulo',
    chapterItem: 'Capítulo {n}',
    bible: 'Biblia',
    footnote: 'Footnote',
    hebrewSubtitle: 'Hebreo (Original)',
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
  const [modalType, setModalType] = useState<
    'translation' | 'book' | 'chapter' | 'verse-detail' | null
  >(null);
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | null>(null);

  // To prevent the "content flash" during modal dismissal (where it defaults to
  // the chapter selector during the fade-out animation), we track the last
  // active modal type to keep the UI stable.
  const [lastActiveType, setLastActiveType] = useState<typeof modalType>(null);
  useEffect(() => {
    if (modalType) {
      setLastActiveType(modalType);
    }
  }, [modalType]);

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

  /**
   * Renders individual content items (text, formatted text, footnotes, etc.)
   * Handles poetic indentation and Words of Jesus styling.
   */
  const renderItemContent = (item: any, i: number) => {
    if (typeof item === 'string') return <Text key={i}>{item}</Text>;

    // Formatted Text (Poetry, Words of Jesus)
    if ('text' in item) {
      const isPoetic = item.poem !== undefined;
      // Indentation: level 1 is base, level 2+ are indented.
      // We use non-breaking spaces (\u00A0) for consistent padding in Text components.
      const indent =
        isPoetic && item.poem > 1 ? '\u00A0'.repeat((item.poem - 1) * 3) : '';

      return (
        <Text key={i} style={[item.wordsOfJesus && { color: theme.colors.error }]}>
          {/* If it's a poetic segment and not the first item, start a new line */}
          {isPoetic && i > 0 ? '\n' : ''}
          {indent}
          {item.text}
        </Text>
      );
    }

    // Footnote Markers: Renders a superscript-style caller (e.g., * or a)
    if ('noteId' in item) {
      return (
        <Text key={i} style={[styles.footnoteMarker, { color: theme.colors.primary }]}>
          {chapterData?.chapter.footnotes.find((f) => f.noteId === item.noteId)?.caller ||
            '*'}
        </Text>
      );
    }

    // Inline Headings or Line Breaks
    if ('heading' in item) {
      return (
        <Text
          key={i}
          style={[styles.inlineHeading, { color: theme.colors.onSurfaceVariant }]}
        >
          {`\n${item.heading}\n`}
        </Text>
      );
    }
    if ('lineBreak' in item) return <Text key={i}>{'\n'}</Text>;

    return null;
  };

  /**
   * Finds the subtitle (e.g., Psalm superscription) associated with a specific verse.
   * Scans backwards from the verse to find an associated subtitle before hitting another verse.
   */
  const getAssociatedSubtitle = (verseNum: number) => {
    if (!chapterData) return null;
    const content = chapterData.chapter.content;
    const vIdx = content.findIndex((c) => c.type === 'verse' && c.number === verseNum);
    if (vIdx === -1) return null;

    for (let i = vIdx - 1; i >= 0; i--) {
      const item = content[i];
      if (item.type === 'hebrew_subtitle')
        return item as BibleService.ChapterHebrewSubtitle;
      if (item.type === 'verse' || item.type === 'heading') break;
    }
    return null;
  };

  /**
   * Helper to check if a verse has footnotes or an associated original language subtitle.
   * This prevents opening empty modals.
   */
  const getVerseExtras = (verseNum: number) => {
    const hasFootnotes = chapterData?.chapter.footnotes.some(
      (f) => f.reference?.verse === verseNum,
    );
    const hasSubtitle = !!getAssociatedSubtitle(verseNum);
    return { hasFootnotes, hasSubtitle };
  };

  /**
   * Opens the "Verse Detail" modal. This modal aggregates footnotes
   * and Hebrew/Greek subtitles relevant to the specific verse tapped.
   */
  const openVerseDetails = (num: number) => {
    const { hasFootnotes, hasSubtitle } = getVerseExtras(num);
    if (hasFootnotes || hasSubtitle) {
      setSelectedVerseNum(num);
      setModalType('verse-detail');
    }
  };

  const renderContent = (content: BibleService.ChapterContent, index: number) => {
    switch (content.type) {
      case 'heading':
        return (
          <Text
            key={index}
            style={[styles.heading, { color: theme.colors.onBackground }]}
          >
            {content.content.join(' ')}
          </Text>
        );
      case 'hebrew_subtitle':
        return (
          <Text
            key={index}
            style={[styles.hebrewSubtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            {content.content.map((item, i) => renderItemContent(item, i))}
          </Text>
        );
      case 'verse':
        const { hasFootnotes, hasSubtitle } = getVerseExtras(content.number);
        const verseText = (
          <Text style={[styles.verseContainer, { color: theme.colors.onBackground }]}>
            <Text
              style={[
                styles.verseNumber,
                {
                  color:
                    hasFootnotes || hasSubtitle
                      ? theme.colors.primary
                      : theme.colors.outline,
                },
              ]}
            >
              {content.number}{' '}
            </Text>
            {content.content.map((item, i) => renderItemContent(item, i))}
          </Text>
        );

        return hasFootnotes ? (
          <TouchableOpacity
            key={index}
            onPress={() => openVerseDetails(content.number)}
            activeOpacity={0.6}
          >
            {verseText}
          </TouchableOpacity>
        ) : (
          <View key={index}>{verseText}</View>
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
            {lastActiveType === 'verse-detail' ? (
              <>
                <Text
                  variant="titleLarge"
                  style={[styles.modalTitle, { color: theme.colors.onSurface }]}
                >
                  {book?.name} {chapterNum}:{selectedVerseNum}
                </Text>
                <Divider />
                <ScrollView style={styles.modalScroll}>
                  {/* 
                      Hebrew Subtitles: These often contain original language 
                      comparisons (e.g., Psalm superscriptions). In the API, 
                      they usually appear immediately BEFORE the verse they describe.
                  */}
                  {chapterData?.chapter.content.map((content, idx) => {
                    const nextItem = chapterData.chapter.content[idx + 1];
                    if (
                      content.type === 'hebrew_subtitle' &&
                      nextItem?.type === 'verse' &&
                      nextItem.number === selectedVerseNum
                    ) {
                      return (
                        <View key={`sub-${idx}`} style={styles.detailSection}>
                          <Text
                            variant="labelSmall"
                            style={{ color: theme.colors.tertiary, marginBottom: 4 }}
                          >
                            {labels.hebrewSubtitle}
                          </Text>
                          <Text style={[styles.detailText, { fontStyle: 'italic' }]}>
                            {content.content
                              .map((item) =>
                                typeof item === 'string' ? item : (item as any).text,
                              )
                              .join('')}
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })}

                  {/* 
                      Footnotes: Filter the chapter's master footnote list 
                      to show only those referencing the selected verse.
                  */}
                  {chapterData?.chapter.footnotes
                    .filter((f) => f.reference?.verse === selectedVerseNum)
                    .map((f, i) => (
                      <View key={`fn-${i}`} style={styles.detailSection}>
                        <Text
                          variant="labelSmall"
                          style={{ color: theme.colors.primary, marginBottom: 4 }}
                        >
                          {labels.footnote} ({f.caller})
                        </Text>
                        <Text style={styles.detailText}>{f.text}</Text>
                      </View>
                    ))}
                </ScrollView>
              </>
            ) : (
              <>
                <Text
                  variant="titleLarge"
                  style={[styles.modalTitle, { color: theme.colors.onSurface }]}
                >
                  {lastActiveType === 'translation'
                    ? labels.translation
                    : lastActiveType === 'book'
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
                    lastActiveType === 'translation'
                      ? BibleService.SUPPORTED_TRANSLATIONS
                      : lastActiveType === 'book'
                        ? books
                        : Array.from(
                            { length: book?.numberOfChapters || 0 },
                            (_, i) => i + 1,
                          )
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
                        if (lastActiveType === 'translation') {
                          setSupportedTranslation(item as any);
                        } else if (lastActiveType === 'book') {
                          setBook(item as any);
                          setChapterNum(1);
                        } else if (lastActiveType === 'chapter') {
                          setChapterNum(item as any);
                        }
                        closeModal();
                      }}
                      titleStyle={
                        (lastActiveType === 'translation' &&
                          typeof item === 'object' &&
                          item.id === supportedTranslation.id) ||
                        (lastActiveType === 'book' &&
                          typeof item === 'object' &&
                          item.id === book?.id) ||
                        (lastActiveType === 'chapter' && item === chapterNum)
                          ? { color: theme.colors.primary, fontWeight: 'bold' }
                          : { color: theme.colors.onSurface }
                      }
                    />
                  )}
                />
              </>
            )}
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
    fontWeight: '800',
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
  hebrewSubtitle: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.8,
  },
  inlineHeading: {
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 24,
  },
  footnoteMarker: {
    fontSize: 12,
    fontWeight: 'bold',
    position: 'relative',
    top: -4,
    lineHeight: 14,
  },
  lineBreak: {
    height: 16,
  },
  poemText: {},
  modalScroll: {
    padding: 16,
    maxHeight: 400,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    lineHeight: 24,
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
