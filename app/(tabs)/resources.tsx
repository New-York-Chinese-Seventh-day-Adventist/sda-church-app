import { MenuCard } from "@/components/MenuCard";
import { LanguageContext } from "@/constants/Contexts";
import { DESIGN_TOKENS } from "@/constants/Layout";
import { fetchBooks, fetchChapter, TRANSLATIONS } from "@/utils/bibleService";
import { openSpotifyPodcast } from "@/utils/spotifyService";
import { openSabbathStream } from "@/utils/youtubeService";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { List, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const allLabels = {
  en: {
    sermonsWorship: "Watch & Listen",
    studyLiturgy: "Study & Liturgy",
    bible: "Holy Bible",
    bibleSub: "Read scripture in multiple languages",
    youtube: "Full Services",
    youtubeSub: "Watch our latest worship services",
    spotify: "Audio Archive",
    spotifySub: "Listen to our sermons and Bible study classes",
    hymnal: "Hymnal",
    hymnalSub: "Lyrics and music for worship",
    library: "Library",
    librarySub: "Devotionals, PDFs and guides",
    book: "Book",
    chapter: "Chapter",
    translation: "Translation",
    select: "Select",
  },
  zh: {
    sermonsWorship: "觀看與收聽",
    studyLiturgy: "研經與禮儀",
    bible: "聖經",
    bibleSub: "閱讀多種語言的聖經",
    youtube: "完整崇拜服務",
    youtubeSub: "觀看最新的崇拜服務",
    spotify: "音頻檔案",
    spotifySub: "收聽我們的證道與研經課程",
    hymnal: "詩歌本",
    hymnalSub: "敬拜用的歌詞與音樂",
    library: "圖書館",
    librarySub: "靈修資料、PDF 與指南",
    book: "書卷",
    chapter: "章節",
    translation: "譯本",
    select: "選擇",
  },
  "zh-cn": {
    sermonsWorship: "观看与收听",
    studyLiturgy: "研经与礼仪",
    bible: "圣经",
    bibleSub: "阅读多种语言的圣经",
    youtube: "完整崇拜服务",
    youtubeSub: "观看最新的崇拜服务",
    spotify: "音频存档",
    spotifySub: "收听我们的证道与研经课程",
    hymnal: "诗歌本",
    hymnalSub: "敬拜用的歌词与音乐",
    library: "图书馆",
    librarySub: "灵修资料、PDF 与指南",
    book: "书卷",
    chapter: "章节",
    translation: "译本",
    select: "选择",
  },
  es: {
    sermonsWorship: "Ver y Escuchar",
    studyLiturgy: "Estudio y Liturgia",
    bible: "Santa Biblia",
    bibleSub: "Lee las escrituras en varios idiomas",
    youtube: "Servicios Completos",
    youtubeSub: "Mira nuestros últimos servicios de adoración",
    spotify: "Archivo de Audio",
    spotifySub: "Escucha nuestros sermones y clases de estudio bíblico",
    hymnal: "Himnario",
    hymnalSub: "Letras y música para la adoración",
    library: "Biblioteca",
    librarySub: "Devocionales, PDFs y guías",
    book: "Libro",
    chapter: "Capítulo",
    translation: "Traducción",
    select: "Seleccionar",
  },
};

export default function ResourcesScreen() {
  const theme = useTheme();
  const { language } = useContext(LanguageContext);
  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const [mode, setMode] = useState<"menu" | "bible">("menu");
  const [translation, setTranslation] = useState("BSB");
  const [book, setBook] = useState<any>(null);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<
    "translation" | "book" | "chapter" | null
  >(null);

  // Helper to open external links safely
  const handleExternalLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err),
    );
  };

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
    if (mode === "bible" && book) {
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
  }, [mode, translation, book, chapter]);

  const renderMenu = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: headerHeight },
      ]}
    >
      <List.Section>
        <List.Subheader
          style={[styles.subheader, { color: theme.colors.onBackground }]}
        >
          {labels.sermonsWorship}
        </List.Subheader>
        <MenuCard
          title={labels.youtube}
          description={labels.youtubeSub}
          icon="youtube"
          iconColor={(theme.colors as any).brandYoutube}
          onPress={openSabbathStream}
        />

        <MenuCard
          title={labels.spotify}
          description={labels.spotifySub}
          icon="spotify"
          iconColor={(theme.colors as any).brandSpotify}
          onPress={openSpotifyPodcast}
        />
      </List.Section>

      <List.Section>
        <List.Subheader
          style={[styles.subheader, { color: theme.colors.onBackground }]}
        >
          {labels.studyLiturgy}
        </List.Subheader>
        <MenuCard
          title={labels.bible}
          description={labels.bibleSub}
          icon="book-cross"
          iconColor={theme.colors.tertiary}
          onPress={() => setMode("bible")}
        />

        <MenuCard
          title={labels.hymnal}
          description={labels.hymnalSub}
          icon="music-note"
          iconColor={theme.colors.tertiary}
          onPress={() =>
            handleExternalLink("https://www.adventisthymnals.com/")
          }
        />

        <MenuCard
          title={labels.library}
          description={labels.librarySub}
          icon="bookshelf"
          iconColor={theme.colors.tertiary}
        />
      </List.Section>
    </ScrollView>
  );

  const renderBibleReader = () => (
    <View style={[styles.readerContainer, { paddingTop: headerHeight }]}>
      <View
        style={[
          styles.readerHeader,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outlineVariant,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setMode("menu")}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={DESIGN_TOKENS.ICON_SIZE_STANDARD}
            color={theme.colors.tertiary}
          />
        </TouchableOpacity>
        <View style={styles.selectorRow}>
          <TouchableOpacity
            style={[
              styles.selector,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
            onPress={() => setSelecting("book")}
          >
            <Text
              style={[styles.selectorText, { color: theme.colors.primary }]}
            >
              {book?.name || labels.book}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.selector,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
            onPress={() => setSelecting("chapter")}
          >
            <Text
              style={[styles.selectorText, { color: theme.colors.primary }]}
            >
              {chapter}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.selector,
              { backgroundColor: theme.colors.secondaryContainer },
            ]}
            onPress={() => setSelecting("translation")}
          >
            <Text
              style={[styles.selectorText, { color: theme.colors.primary }]}
            >
              {translation}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.bibleScroll}
          contentContainerStyle={styles.bibleContent}
        >
          {verses.map((v) => (
            <Text
              key={v.number}
              style={[styles.verseText, { color: theme.colors.onBackground }]}
            >
              <Text
                style={[styles.verseNumber, { color: theme.colors.primary }]}
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
          style={[styles.overlay, { backgroundColor: theme.colors.background }]}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.colors.outlineVariant },
              ]}
            >
              <Text
                style={[styles.modalTitle, { color: theme.colors.onSurface }]}
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
                      styles.modalItem,
                      { borderBottomColor: theme.colors.outlineVariant },
                    ]}
                    onPress={() => {
                      setTranslation(t.id);
                      setSelecting(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
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
                      styles.modalItem,
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
                        styles.modalItemText,
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
                        styles.modalItem,
                        { borderBottomColor: theme.colors.outlineVariant },
                      ]}
                      onPress={() => {
                        setChapter(c);
                        setSelecting(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalItemText,
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

  return mode === "menu" ? renderMenu() : renderBibleReader();
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20 },
  subheader: {
    fontWeight: "bold",
    fontSize: 16,
  },

  // Bible Reader
  readerContainer: { flex: 1 },
  readerHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    zIndex: 10,
    height: 56,
  },
  backButton: { padding: 15 },
  selectorRow: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "flex-start",
    gap: 8,
    paddingRight: 15,
  },
  selector: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  selectorText: { fontWeight: "700", fontSize: 13 },
  bibleScroll: { flex: 1 },
  bibleContent: { padding: 20, paddingBottom: 80 },
  verseText: {
    fontSize: 19,
    lineHeight: 30,
    marginBottom: 14,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: "800",
    opacity: 0.5,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Modals
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 0.5,
  },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  modalItem: {
    padding: 18,
    borderBottomWidth: 0.5,
  },
  modalItemText: { fontSize: 16 },
});
