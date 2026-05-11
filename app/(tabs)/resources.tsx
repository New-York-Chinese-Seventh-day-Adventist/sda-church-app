import { MenuCard } from "@/components/MenuCard";
import { LanguageContext } from "@/constants/Contexts";
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
import { useTheme } from "react-native-paper";

const allLabels = {
  en: {
    title: "Resources",
    bible: "Holy Bible",
    bibleSub: "Read scripture in multiple languages",
    youtube: "YouTube Sermons",
    youtubeSub: "Watch our latest worship services",
    spotify: "Spotify Podcast",
    spotifySub: "Listen to our latest messages",
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
    title: "資源庫",
    bible: "聖經",
    bibleSub: "閱讀多種語言的聖經",
    youtube: "YouTube 證道",
    youtubeSub: "觀看最新的崇拜服務",
    spotify: "Spotify 播客",
    spotifySub: "收聽最新的信息",
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
    title: "资源库",
    bible: "圣经",
    bibleSub: "阅读多种语言的圣经",
    youtube: "YouTube 证道",
    youtubeSub: "观看最新的崇拜服务",
    spotify: "Spotify 播客",
    spotifySub: "收听最新的信息",
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
    title: "Recursos",
    bible: "Santa Biblia",
    bibleSub: "Lee las escrituras en varios idiomas",
    youtube: "Sermones en YouTube",
    youtubeSub: "Mira nuestros últimos servicios de adoración",
    spotify: "Podcast en Spotify",
    spotifySub: "Escucha nuestros mensajes más recientes",
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
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        {labels.title}
      </Text>

      <MenuCard
        title={labels.bible}
        description={labels.bibleSub}
        icon="book-open-variant"
        onPress={() => setMode("bible")}
      />

      <MenuCard
        title={labels.youtube}
        description={labels.youtubeSub}
        icon="youtube"
        iconColor={theme.dark ? undefined : "#FF0000"}
        onPress={openSabbathStream}
      />

      <MenuCard
        title={labels.spotify}
        description={labels.spotifySub}
        icon="spotify"
        iconColor={theme.dark ? undefined : "#1DB954"}
        onPress={openSpotifyPodcast}
      />

      <MenuCard
        title={labels.hymnal}
        description={labels.hymnalSub}
        icon="music-note"
        onPress={() => handleExternalLink("https://www.adventisthymnals.com/")}
      />

      <MenuCard
        title={labels.library}
        description={labels.librarySub}
        icon="library"
      />
    </ScrollView>
  );

  const renderBibleReader = () => (
    <View style={styles.readerContainer}>
      <SafeAreaView
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
            size={24}
            color={theme.colors.primary}
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
      </SafeAreaView>

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
                  size={24}
                  color={theme.colors.onSurface}
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  // Bible Reader
  readerContainer: { flex: 1 },
  readerHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    zIndex: 10,
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
  bibleContent: { padding: 20, paddingBottom: 50 },
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
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  modalItem: {
    padding: 18,
    borderBottomWidth: 1,
  },
  modalItemText: { fontSize: 16 },
});
