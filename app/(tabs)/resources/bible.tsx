import { UIStateContext } from '@/app/(tabs)/_layout';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Divider, IconButton, List, Modal, Portal, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import * as BibleService from '@/services/BibleService';
import { NavigationStyles } from '@/styles/NavigationStyles';
import { ReaderStyles } from '@/styles/ReaderStyles';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Generalizing dimensions to ensure responsiveness across iPhone/Tablet
const DOCK_HEIGHT = 60;
// This margin should match the approximate height of the bottom tab bar to ensure they sit flush.
const DOCK_BOTTOM_MARGIN = 49;
const FOOTER_PADDDING_OFFSET = 150;
const uiLabels = {
  en: {
    translation: 'Translation',
    book: 'Book',
    chapter: 'Chapter',
    chapterItem: 'Chapter {n}',
    bible: 'Bible',
    footnote: 'Footnote',
    hebrewSubtitle: 'Hebrew (Original)',
    prevChapter: 'Prev',
    nextChapter: 'Next',
    en: 'English',
    zh: 'Chinese (Traditional)',
    'zh-cn': 'Chinese (Simplified)',
    es: 'Spanish',
  },
  zh: {
    translation: '譯本',
    book: '書卷',
    chapter: '章節',
    chapterItem: '第 {n} 章',
    bible: '聖經',
    footnote: '腳注',
    hebrewSubtitle: '希伯來語 (原文)',
    prevChapter: '上一章',
    nextChapter: '下一章',
    en: '英文',
    zh: '繁體中文',
    'zh-cn': '簡體中文',
    es: '西班牙文',
  },
  'zh-cn': {
    translation: '译本',
    book: '书卷',
    chapter: '章节',
    chapterItem: '第 {n} 章',
    bible: '圣经',
    footnote: '脚注',
    hebrewSubtitle: '希伯来语 (原文)',
    prevChapter: '上一章',
    nextChapter: '下一章',
    en: '英文',
    zh: '繁体中文',
    'zh-cn': '简体中文',
    es: '西班牙文',
  },
  es: {
    translation: 'Traducción',
    book: 'Libro',
    chapter: 'Capítulo',
    chapterItem: 'Capítulo {n}',
    bible: 'Biblia',
    footnote: 'Footnote',
    hebrewSubtitle: 'Hebreo (Original)',
    prevChapter: 'Anterior',
    nextChapter: 'Siguiente',
    en: 'Inglés',
    zh: 'Chino (Tradicional)',
    'zh-cn': 'Chino (Simplificado)',
    es: 'Español',
  },
};

export default function BibleReaderScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { language } = useContext(LanguageContext);
  const { menuAnim, setMenuVisible } = useContext(UIStateContext);

  const labels = uiLabels[language as keyof typeof uiLabels] || uiLabels.en;
  const scrollRef = useRef<ScrollView>(null);
  const lastScrollY = useRef(0);
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

  // Keep the Bible dock visible at the bottom of the screen at all times.
  // We only animate the height so it "drops" down to the bottom when the tab bar hides.
  const dockTranslateY = 0;

  // Taller when expanded to overlap the tab bar area; shorter when retracted to sit at the absolute bottom.
  const animatedDockHeight = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      DOCK_HEIGHT + insets.bottom,
      DOCK_HEIGHT + DOCK_BOTTOM_MARGIN + insets.bottom,
    ],
  });

  // Data state
  const [books, setBooks] = useState<BibleService.TranslationBook[]>([]);
  const [chapterData, setChapterData] =
    useState<BibleService.TranslationBookChapter | null>(null);
  const [loading, setLoading] = useState(false);

  // Determine navigation boundaries
  const currentBookIdx = books.findIndex((b) => b.id === book?.id);
  const isFirstChapter = chapterNum === 1 && currentBookIdx === 0;
  const isLastChapter = !!(
    book &&
    chapterNum === book.numberOfChapters &&
    currentBookIdx === books.length - 1 &&
    currentBookIdx !== -1
  );

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  /**
   * Handles automatic audio transition when a track finishes.
   */
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && status.didJustFinish) {
      setIsPlaying(false);
      if (!isLastChapter) {
        // Signal that the next chapter should start playing automatically
        setShouldAutoPlay(true);
        navigateToChapter('next');
      }
    }
  };

  const toggleAudio = async () => {
    const audioLinks = chapterData?.thisChapterAudioLinks;
    if (!audioLinks || Object.keys(audioLinks).length === 0) return;

    // Get the first available reader's audio URL
    const audioUrl = Object.values(audioLinks)[0];

    try {
      if (isPlaying) {
        await soundRef.current?.pauseAsync();
        setIsPlaying(false);
      } else {
        if (!soundRef.current) {
          const { sound } = await Audio.Sound.createAsync(
            { uri: audioUrl as string },
            { shouldPlay: true },
          );
          soundRef.current = sound;
          sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        } else {
          await soundRef.current.playAsync();
        }
        setIsPlaying(true);
      }
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  // Effect to handle auto-playing when advancing chapters via audio or gesture
  useEffect(() => {
    const autoPlayNext = async () => {
      if (shouldAutoPlay && chapterData?.thisChapterAudioLinks) {
        setShouldAutoPlay(false);
        // Small delay to ensure the UI has transitioned before audio starts
        setTimeout(() => toggleAudio(), 500);
      }
    };
    if (chapterData && !loading) {
      autoPlayNext();
    }
  }, [chapterData, loading]);

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

  /**
   * Navigates to the next or previous chapter.
   * Automatically handles transitioning between books (e.g., Matt 28 -> Mark 1).
   */
  const navigateToChapter = (direction: 'prev' | 'next') => {
    if (!book || books.length === 0) return;
    const currentBookIdx = books.findIndex((b) => b.id === book.id);

    if (direction === 'prev') {
      if (chapterNum > 1) {
        setChapterNum((prev) => prev - 1);
      } else if (currentBookIdx > 0) {
        const prevBook = books[currentBookIdx - 1];
        setBook(prevBook);
        setChapterNum(prevBook.numberOfChapters);
      }
    } else {
      if (chapterNum < book.numberOfChapters) {
        setChapterNum((prev) => prev + 1);
      } else if (currentBookIdx < books.length - 1) {
        const nextBook = books[currentBookIdx + 1];
        setBook(nextBook);
        setChapterNum(1);
      }
    }
  };

  /**
   * Scroll handler to toggle Reader Mode (hiding/showing menus)
   */
  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    // Ignore bounces
    if (currentOffset < 0) return;

    // If we've scrolled more than a small threshold, determine direction
    if (Math.abs(currentOffset - lastScrollY.current) > 15) {
      if (currentOffset > lastScrollY.current && currentOffset > 100) {
        // Scrolling down: Hide menus
        setMenuVisible(false);
      } else {
        // Scrolling up: Show menus
        setMenuVisible(true);
      }
      lastScrollY.current = currentOffset;
    }
  };

  // Scroll to top when chapter content changes
  useEffect(() => {
    // Ensure menus are visible on mount or chapter change
    setMenuVisible(true);

    if (chapterData) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }

    // Stop and unload audio when the chapter changes or the component unmounts
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsPlaying(false);
      }
      // Always restore menus when leaving the reader
      setMenuVisible(true);
    };
  }, [chapterData, setMenuVisible]);

  /**
   * Renders individual content items (text, formatted text, footnotes, etc.)
   * Handles poetic indentation and Words of Jesus styling.
   */
  const renderItemContent = (item: any, i: number, contentArray: any[]) => {
    // Peek ahead to see if this text segment is followed by a footnote marker.
    // We skip whitespace-only strings to ensure the word itself gets underlined.
    let isFootnoted = false;
    for (let j = i + 1; j < contentArray.length; j++) {
      const next = contentArray[j];
      if (typeof next === 'object' && 'noteId' in next) {
        isFootnoted = true;
        break;
      }
      // If we hit another word or a heading before a footnote, stop searching.
      if (typeof next === 'string' && next.trim().length > 0) break;
      if (typeof next === 'object' && ('text' in next || 'heading' in next)) break;
      // Continue if it's just a space or empty string
    }

    const renderText = (text: string, style?: any) => {
      if (!isFootnoted)
        return (
          <Text key={i} style={style}>
            {text}
          </Text>
        );

      const trimmed = text.trimEnd();
      const trailing = text.substring(trimmed.length);

      return (
        <Text key={i}>
          {trimmed ? (
            <View
              style={{
                borderBottomWidth: 1.5,
                borderBottomColor: theme.colors.primary,
                marginBottom: -2,
                display: 'inline-flex' as any,
              }}
            >
              <Text style={style}>{trimmed}</Text>
            </View>
          ) : null}
          {trailing ? <Text style={style}>{trailing}</Text> : null}
        </Text>
      );
    };

    if (typeof item === 'string') {
      return renderText(item);
    }

    // Formatted Text (Poetry, Words of Jesus)
    if ('text' in item) {
      const isPoetic = item.poem !== undefined;
      // Indentation: level 1 is base, level 2+ are indented.
      // We use non-breaking spaces (\u00A0) for consistent padding in Text components.
      const indent =
        isPoetic && item.poem > 1 ? '\u00A0'.repeat((item.poem - 1) * 3) : '';

      const prefix = (isPoetic && i > 0 ? '\n' : '') + indent;
      return renderText(
        prefix + item.text,
        item.wordsOfJesus && { color: theme.colors.error },
      );
    }

    // Footnote Markers: Now that we have underlines, we skip rendering the literal
    // superscript caller (e.g., * or a) to maintain a cleaner reading experience.
    if ('noteId' in item) return null;

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
            style={[ReaderStyles.heading, { color: theme.colors.onBackground }]}
          >
            {content.content.join(' ')}
          </Text>
        );
      case 'hebrew_subtitle':
        return (
          <Text
            key={index}
            style={[
              ReaderStyles.hebrewSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {content.content.map((item, i) =>
              renderItemContent(item, i, content.content),
            )}
          </Text>
        );
      case 'verse':
        const { hasFootnotes, hasSubtitle } = getVerseExtras(content.number);
        const verseText = (
          <Text
            style={[ReaderStyles.verseContainer, { color: theme.colors.onBackground }]}
          >
            <Text
              style={[
                ReaderStyles.verseNumber,
                {
                  color:
                    hasFootnotes || hasSubtitle
                      ? theme.colors.primary
                      : theme.colors.outline,
                  textDecorationLine: 'none',
                },
              ]}
            >
              {content.number}{' '}
            </Text>
            {content.content.map((item, i) =>
              renderItemContent(item, i, content.content),
            )}
          </Text>
        );

        return hasFootnotes || hasSubtitle ? (
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
        return <View key={index} style={ReaderStyles.lineBreak} />;
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
      <ScrollView
        ref={scrollRef}
        bounces={true}
        alwaysBounceVertical={true}
        scrollEventThrottle={32}
        onScroll={handleScroll}
        contentContainerStyle={[
          ReaderStyles.scrollContent,
          {
            paddingTop: headerHeight + 10,
            paddingBottom: insets.bottom + FOOTER_PADDDING_OFFSET,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator style={ReaderStyles.loader} color={theme.colors.primary} />
        ) : (
          <>
            {chapterData?.chapter.content.map((c, i) => renderContent(c, i))}
            {chapterData?.translation.attribution && !loading && (
              <Text
                variant="labelSmall"
                style={{
                  textAlign: 'center',
                  marginTop: 24,
                  marginBottom: 20,
                  opacity: 0.5,
                }}
              >
                {chapterData.translation.attribution}
              </Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Audio Toggle Overlay */}
      {chapterData?.thisChapterAudioLinks &&
        Object.keys(chapterData.thisChapterAudioLinks).length > 0 && (
          <Animated.View
            style={[
              ReaderStyles.floatingAudioButton,
              {
                opacity: menuAnim,
                transform: [
                  {
                    translateY: menuAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
                bottom: animatedDockHeight.interpolate({
                  inputRange: [
                    DOCK_HEIGHT + insets.bottom,
                    DOCK_HEIGHT + DOCK_BOTTOM_MARGIN + insets.bottom,
                  ],
                  outputRange: [
                    DOCK_HEIGHT + insets.bottom + 16,
                    DOCK_HEIGHT + DOCK_BOTTOM_MARGIN + insets.bottom + 16,
                  ],
                }),
              },
            ]}
          >
            <IconButton
              icon={isPlaying ? 'pause' : 'play'}
              mode="contained"
              containerColor={theme.colors.tertiary}
              iconColor={theme.colors.onPrimary}
              size={32}
              onPress={toggleAudio}
              elevation={4}
            />
          </Animated.View>
        )}

      {/* Control Dock: Sticky Bottom Navigation & Action Bar */}
      <Animated.View
        style={[
          ReaderStyles.controlDock,
          {
            bottom: 0,
            height: animatedDockHeight,
            transform: [{ translateY: dockTranslateY }],
          },
        ]}
      >
        <AnimatedBlurView
          intensity={80}
          tint={theme.blurTint}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.dark
                ? 'rgba(15, 15, 15, 0.75)'
                : 'rgba(255, 255, 255, 0.85)',
            },
          ]}
        />
        <View style={ReaderStyles.dockInner}>
          <View style={ReaderStyles.sideSlot}>
            {!isFirstChapter ? (
              <IconButton
                icon="chevron-left"
                size={26}
                onPress={() => navigateToChapter('prev')}
                style={ReaderStyles.navIcon}
              />
            ) : (
              <View style={ReaderStyles.buttonPlaceholder} />
            )}
          </View>

          <View style={ReaderStyles.pillsContainer}>
            <TouchableOpacity
              style={[
                ReaderStyles.pill,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              onPress={() => setModalType('translation')}
            >
              <Text numberOfLines={1} style={ReaderStyles.pillText}>
                {supportedTranslation.name}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                ReaderStyles.pill,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              onPress={() => setModalType('book')}
            >
              <Text numberOfLines={1} style={ReaderStyles.pillText}>
                {book?.name || '...'}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                ReaderStyles.pill,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              onPress={() => setModalType('chapter')}
            >
              <Text style={ReaderStyles.pillText}>{chapterNum}</Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          <View style={ReaderStyles.sideSlot}>
            {!isLastChapter ? (
              <IconButton
                icon="chevron-right"
                size={26}
                onPress={() => navigateToChapter('next')}
                style={ReaderStyles.navIcon}
              />
            ) : (
              <View style={ReaderStyles.buttonPlaceholder} />
            )}
          </View>
        </View>
      </Animated.View>

      {/* Selection Modals */}
      <Portal>
        <Modal
          visible={!!modalType}
          onDismiss={closeModal}
          contentContainerStyle={[
            ReaderStyles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={ReaderStyles.modalInner}>
            {lastActiveType === 'verse-detail' ? (
              <>
                <Text
                  variant="titleLarge"
                  style={[ReaderStyles.modalTitle, { color: theme.colors.onSurface }]}
                >
                  {book?.name} {chapterNum}:{selectedVerseNum}
                </Text>
                <Divider />
                <ScrollView style={ReaderStyles.modalScroll}>
                  {/* 
                      Hebrew Subtitles: These often contain original language 
                      comparisons (e.g., Psalm superscriptions). In the API, 
                      they usually appear immediately BEFORE the verse they describe.
                  */}
                  {(() => {
                    const subtitle = getAssociatedSubtitle(selectedVerseNum || 0);
                    if (!subtitle) return null;
                    return (
                      <View style={ReaderStyles.detailSection}>
                        <Text
                          variant="labelSmall"
                          style={{ color: theme.colors.tertiary, marginBottom: 4 }}
                        >
                          {labels.hebrewSubtitle}
                        </Text>
                        <Text style={[ReaderStyles.detailText, { fontStyle: 'italic' }]}>
                          {subtitle.content
                            .map((item) => {
                              if (typeof item === 'string') return item;
                              if ('text' in item) return item.text;
                              return '';
                            })
                            .join('')}
                        </Text>
                      </View>
                    );
                  })()}

                  {/* 
                      Footnotes: Filter the chapter's master footnote list 
                      to show only those referencing the selected verse.
                  */}
                  {chapterData?.chapter.footnotes
                    .filter((f) => f.reference?.verse === selectedVerseNum)
                    .map((f, i) => (
                      <View key={`fn-${i}`} style={ReaderStyles.detailSection}>
                        <Text
                          variant="labelSmall"
                          style={{ color: theme.colors.primary, marginBottom: 4 }}
                        >
                          {labels.footnote} ({f.caller})
                        </Text>
                        <Text style={ReaderStyles.detailText}>{f.text}</Text>
                      </View>
                    ))}
                </ScrollView>
              </>
            ) : (
              <>
                <Text
                  variant="titleLarge"
                  style={[ReaderStyles.modalTitle, { color: theme.colors.onSurface }]}
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
                        typeof item === 'object' && 'lang' in item
                          ? (labels as any)[item.lang]
                          : undefined
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
