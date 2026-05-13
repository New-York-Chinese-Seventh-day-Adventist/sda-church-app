import { LanguageContext } from "@/constants/LanguageContext";
import { DESIGN_TOKENS } from "@/constants/Layout";
import { useAppTheme } from "@/constants/Themes";
import {
  fetchBooks,
  fetchChapter,
  TRANSLATIONS,
} from "@/services/BibleService";
import { ReaderStyles } from "@/styles/ReaderStyles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, Stack } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const bibleLabels = {
  en: {
    bible: "Holy Bible",
    book: "Book",
    chapter: "Chapter",
    translation: "Translation",
    select: "Select",
  },
  zh: {
    bible: "聖經",
    book: "書卷",
    chapter: "章節",
    translation: "譯本",
    select: "選擇",
  },
  "zh-cn": {
    bible: "圣经",
    book: "书卷",
    chapter: "章节",
    translation: "译本",
    select: "选择",
  },
  es: {
    bible: "Santa Biblia",
    book: "Libro",
    chapter: "Capítulo",
    translation: "Traducción",
    select: "Seleccionar",
  },
};

export default function BibleReaderScreen() {
  const theme = useAppTheme();
  const { language } = useContext(LanguageContext);
  const labels =
    bibleLabels[language as keyof typeof bibleLabels] || bibleLabels.en;

  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  // Map the app UI language to the most appropriate default Bible translation
  const getDefaultTranslation = (lang: string) => {
    if (lang === "zh") return "CUV";
    if (lang === "zh-cn") return "CUVS";
    if (lang === "es") return "SSE";
    return "BSB";
  };

  const [translation, setTranslation] = useState(() =>
    getDefaultTranslation(language),
  );
  const [book, setBook] = useState<any>(null);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<
    "translation" | "book" | "chapter" | null
  >(null);

  // Initial load: Fetch book list for the default translation
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const booksData = await fetchBooks(translation);
        setBooks(booksData);
        if (!book && booksData.length > 0) setBook(booksData[0]);
      } catch (e) {
        console.error("Failed to load Bible books metadata", e);
      }
    };
    loadBooks();
  }, [translation]);

  // Lazy-load Chapter Content: Triggered when user navigates to a new chapter or changes translation
  useEffect(() => {
    if (book) {
      const loadVerses = async () => {
        setLoading(true);
        try {
          const versesData = await fetchChapter(translation, book.id, chapter);
          setVerses(versesData);
        } catch (e) {
          console.error("Failed to load chapter content", e);
        } finally {
          setLoading(false);
        }
      };
      loadVerses();
    }
  }, [translation, book, chapter]);

  return (
    <View style={[ReaderStyles.readerContainer, { paddingTop: headerHeight }]}>
      <Stack.Screen
        options={{ title: labels.bible, backTo: "/resources" } as any}
      />
      <View
        style={[
          ReaderStyles.readerHeader,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={ReaderStyles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={DESIGN_TOKENS.ICON_SIZE_STANDARD}
            color={theme.colors.tertiary}
          />
        </TouchableOpacity>
        <View style={ReaderStyles.selectorRow}>
          <TouchableOpacity
            style={[
              ReaderStyles.selector,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
            onPress={() => setSelecting("book")}
          >
            <Text
              style={[
                ReaderStyles.selectorText,
                { color: theme.colors.primary },
              ]}
            >
              {book?.name || labels.book}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              ReaderStyles.selector,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
            onPress={() => setSelecting("chapter")}
          >
            <Text
              style={[
                ReaderStyles.selectorText,
                { color: theme.colors.primary },
              ]}
            >
              {chapter}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              ReaderStyles.selector,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
            onPress={() => setSelecting("translation")}
          >
            <Text
              style={[
                ReaderStyles.selectorText,
                { color: theme.colors.primary },
              ]}
            >
              {translation}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={ReaderStyles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={ReaderStyles.bibleScroll}
          contentContainerStyle={ReaderStyles.bibleContent}
        >
          {verses.map((v) => (
            <Text
              key={v.number}
              style={[
                ReaderStyles.verseText,
                { color: theme.colors.onBackground },
              ]}
            >
              <Text
                style={[
                  ReaderStyles.verseNumber,
                  { color: theme.colors.primary },
                ]}
              >
                {v.number}
              </Text>
              {"  "}
              {v.text}
            </Text>
          ))}
        </ScrollView>
      )}

      {/* Selection Overlays */}
      {selecting && (
        <View
          style={[
            ReaderStyles.overlay,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View
              style={[
                ReaderStyles.modalHeader,
                { borderBottomColor: theme.colors.outlineVariant },
              ]}
            >
              <Text
                style={[
                  ReaderStyles.modalTitle,
                  { color: theme.colors.onSurface },
                ]}
              >
                {labels.select}{" "}
                {labels[selecting as keyof typeof labels] || selecting}
              </Text>
              <TouchableOpacity onPress={() => setSelecting(null)}>
                <MaterialCommunityIcons
                  name="close"
                  size={DESIGN_TOKENS.ICON_SIZE_STANDARD}
                  color={theme.colors.tertiary}
                />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {selecting === "translation" &&
                TRANSLATIONS.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      ReaderStyles.modalItem,
                      { borderBottomColor: theme.colors.outlineVariant },
                    ]}
                    onPress={() => {
                      setTranslation(t.id);
                      setSelecting(null);
                    }}
                  >
                    <Text
                      style={[
                        ReaderStyles.modalItemText,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              {selecting === "book" &&
                books.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      ReaderStyles.modalItem,
                      { borderBottomColor: theme.colors.outlineVariant },
                    ]}
                    onPress={() => {
                      setBook(b);
                      setChapter(1);
                      setSelecting(null);
                    }}
                  >
                    <Text
                      style={[
                        ReaderStyles.modalItemText,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              {selecting === "chapter" &&
                book &&
                Array.from({ length: book.chapters }, (_, i) => i + 1).map(
                  (c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        ReaderStyles.modalItem,
                        { borderBottomColor: theme.colors.outlineVariant },
                      ]}
                      onPress={() => {
                        setChapter(c);
                        setSelecting(null);
                      }}
                    >
                      <Text
                        style={[
                          ReaderStyles.modalItemText,
                          { color: theme.colors.onSurface },
                        ]}
                      >
                        {labels.chapter} {c}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
            </ScrollView>
          </SafeAreaView>
        </View>
      )}
    </View>
  );
}
