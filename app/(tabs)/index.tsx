import { MenuCard } from '@/components/MenuCard';
import {
  CHURCH_BUILDING_IMAGE_URL,
  CHURCH_LATITUDE,
  CHURCH_LONGITUDE,
  getSunsetApiUrl,
  openSabbathStream,
} from '@/constants/ExternalLinks';
import { LanguageContext, SupportedLanguage } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import * as BibleService from '@/services/BibleService';
import { NavigationStyles } from '@/styles/NavigationStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  ImageBackground,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, List, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { language } = useContext(LanguageContext);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const allLabels = {
    en: {
      welcome: 'Welcome!',
      subtitle: 'Loading daily verse...',
      verseOfDay: 'Verse of the Day',
      readVerse: 'Read Verse',
      shareVerse: 'Share Verse',
      livestream: 'Watch Livestream',
      aboutSDA: 'About Denomination',
      aboutHistory: 'Our History',
      discover: 'Discover',
      thisWeek: 'This Week',
      contact: 'Connect with Us',
      meetTeam: 'Meet Our Team',
      join: 'Joining the Church',
      bulletin: 'Weekly Bulletin',
      explore: 'Explore',
      give: 'Tithe & Offering',
      sabbathStarts: 'Sabbath starts in',
      sabbathEnds: 'Sabbath ends in',
      isSabbath: 'Happy Sabbath!',
      locationLocal: 'Location: Local',
      locationDefault: 'Location: Elmhurst, NY',
    },
    zh: {
      welcome: '歡迎！',
      subtitle: '正在載入經文...',
      verseOfDay: '今日經文',
      readVerse: '查閱經文',
      shareVerse: '分享經文',
      livestream: '觀看直播',
      aboutSDA: '關於教派',
      aboutHistory: '我們的歷史',
      discover: '探索',
      thisWeek: '本週焦點',
      contact: '聯繫我們',
      meetTeam: '認識我們的團隊',
      join: '加入教會',
      bulletin: '每週週報',
      explore: '探索',
      give: '奉獻',
      sabbathStarts: '距離安息日還有',
      sabbathEnds: '距離安息日結束還有',
      isSabbath: '安息日快樂！',
      locationLocal: '位置：目前所在地',
      locationDefault: '位置：紐約艾姆赫斯特',
    },
    'zh-cn': {
      welcome: '欢迎！',
      subtitle: '正在载入经文...',
      verseOfDay: '今日经文',
      readVerse: '查阅经文',
      shareVerse: '分享经文',
      livestream: '观看直播',
      aboutSDA: '关于教派',
      aboutHistory: '我们的历史',
      discover: '探索',
      thisWeek: '本周焦点',
      contact: '联系我们',
      meetTeam: '认识我们的团队',
      join: '加入教会',
      bulletin: '每周周报',
      explore: '探索',
      give: '奉献',
      sabbathStarts: '距离安息日还有',
      sabbathEnds: '距离安息日结束还有',
      isSabbath: '安息日快乐！',
      locationLocal: '位置：当前所在地',
      locationDefault: '位置：纽约艾姆赫斯特',
    },
    es: {
      welcome: '¡Bienvenido!',
      subtitle: 'Cargando versículo...',
      verseOfDay: 'Versículo del Día',
      readVerse: 'Leer Versículo',
      shareVerse: 'Compartir',
      livestream: 'Ver Transmisión',
      aboutSDA: 'Sobre la Denominación',
      aboutHistory: 'Nuestra Historia',
      discover: 'Descubrir',
      thisWeek: 'Esta Semana',
      contact: 'Conéctate con Nosotros',
      meetTeam: 'Conoce a nuestro equipo',
      join: 'Unirse a la Iglesia',
      bulletin: 'Boletín Semanal',
      explore: 'Explorar',
      give: 'Diezmos y Ofrendas',
      sabbathStarts: 'El Sábado comienza en',
      sabbathEnds: 'El Sábado termina en',
      isSabbath: '¡Feliz Sábado!',
      locationLocal: 'Ubicación: Local',
      locationDefault: 'Ubicación: Elmhurst, NY',
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  const [randomVerse, setRandomVerse] = useState<{
    text: string;
    reference: string;
    bookId: string;
    chapter: number;
    verse: number;
    dateKey: string;
  } | null>(null);

  const [isSabbath, setIsSabbath] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [useGps, setUseGps] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sunsets, setSunsets] = useState<{ fri: Date | null; sat: Date | null }>({
    fri: null,
    sat: null,
  });

  const VOTD_CONFIG_KEY = 'votd_selection_config';
  const VOTD_CACHE_KEY = `votd_cache_${language}`;

  // Sabbath Countdown Logic
  useEffect(() => {
    // Detect Location via Web Geolocation API
    if (Platform.OS === 'web' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // User allowed location
          setUseGps(true);
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          // Permission denied or error
          setUseGps(false);
          console.log('Location access denied, falling back to Elmhurst.');
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 3600000 },
      );
    } else {
      // Fallback for offline or unsupported browsers
      setUseGps(false);
    }
  }, []);

  useEffect(() => {
    const fetchSunsets = async () => {
      const lat = useGps && userCoords ? userCoords.lat : CHURCH_LATITUDE;
      const lng = useGps && userCoords ? userCoords.lng : CHURCH_LONGITUDE;

      const now = new Date();
      const getDayDate = (d: number) => {
        const t = new Date(now);
        t.setDate(now.getDate() + (d - now.getDay()));
        return t.toISOString().split('T')[0];
      };

      try {
        const [fRes, sRes] = await Promise.all([
          fetch(getSunsetApiUrl(lat, lng, getDayDate(5))),
          fetch(getSunsetApiUrl(lat, lng, getDayDate(6))),
        ]);
        const fData = await fRes.json();
        const sData = await sRes.json();

        setSunsets({
          fri: fData.results?.sunset ? new Date(fData.results.sunset) : null,
          sat: sData.results?.sunset ? new Date(sData.results.sunset) : null,
        });
      } catch (e) {
        console.warn('Failed to fetch sunset times:', e);
      }
    };
    fetchSunsets();
  }, [useGps, userCoords, new Date().toDateString()]);

  useEffect(() => {
    // If GPS status changes (user clicks "Allow"), the component will re-render
    // and this timer logic will re-calculate based on the new context.
    if (countdown) setCountdown(''); // Reset display to trigger immediate refresh

    const updateTimer = () => {
      const now = new Date();
      const day = now.getDay();

      const getFallback = (d: number) => {
        const t = new Date(now);
        t.setDate(now.getDate() + (d - day));
        t.setHours(18, 0, 0, 0);
        return t;
      };

      const friTarget = sunsets.fri || getFallback(5);
      const satTarget = sunsets.sat || getFallback(6);

      let isSabbathNow = false;
      let target: Date;

      if (now < friTarget) {
        isSabbathNow = false;
        target = friTarget;
      } else if (now < satTarget) {
        isSabbathNow = true;
        target = satTarget;
      } else {
        isSabbathNow = false;
        target = new Date(friTarget);
        target.setDate(target.getDate() + 7);
      }

      setIsSabbath(isSabbathNow);

      const diff = Math.max(0, target.getTime() - now.getTime());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      const dStr = d > 0 ? `${d}d ` : '';
      setCountdown(
        `${dStr}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [useGps, sunsets]); // Re-run timer logic if GPS permission or sunset data changes

  const loadRandomVerse = async () => {
    try {
      // Load a new random verse each day at 6 AM local time.
      // Before 6 AM, show the previous day's verse to maintain consistency with
      // the "Verse of the Day" concept.
      const now = new Date();
      const effectiveDate = new Date(now);
      if (now.getHours() < 6) effectiveDate.setDate(now.getDate() - 1);
      const currentDateKey = `${effectiveDate.getFullYear()}-${effectiveDate.getMonth() + 1}-${effectiveDate.getDate()}`;

      const transId =
        BibleService.DEFAULT_TRANSLATION_MAP[language as SupportedLanguage] || 'BSB';

      // 1. Check if we have the specific translation already cached for today
      const cachedText = await AsyncStorage.getItem(VOTD_CACHE_KEY);
      if (cachedText) {
        const parsed = JSON.parse(cachedText);
        if (parsed.dateKey === currentDateKey) {
          setRandomVerse(parsed);
          return;
        }
      }

      // 2. Check if a master verse was selected for today in any language
      const masterConfig = await AsyncStorage.getItem(VOTD_CONFIG_KEY);
      let selection: { bookId: string; chapter: number; verse: number } | null = null;

      if (masterConfig) {
        const parsed = JSON.parse(masterConfig);
        if (parsed.dateKey === currentDateKey) {
          selection = {
            bookId: parsed.bookId,
            chapter: parsed.chapter,
            verse: parsed.verse,
          };
        }
      }

      // 3. If no master selection exists for today, generate one
      if (!selection) {
        const bsbBooks = await BibleService.fetchBooks('BSB');
        const rand = BibleService.selectRandomChapter(bsbBooks);
        if (rand) {
          const bsbChapter = await BibleService.fetchChapter(
            'BSB',
            rand.book.id,
            rand.chapter,
          );
          const vNum = Math.floor(Math.random() * bsbChapter.numberOfVerses) + 1;
          selection = { bookId: rand.book.id, chapter: rand.chapter, verse: vNum };
          await AsyncStorage.setItem(
            VOTD_CONFIG_KEY,
            JSON.stringify({ ...selection, dateKey: currentDateKey }),
          );
        }
      }

      if (selection) {
        // 4. Load the text for the current language using the shared selection
        const books = await BibleService.fetchBooks(transId);
        const book =
          books.find((b: BibleService.TranslationBook) => b.id === selection?.bookId) ||
          books[0];
        const chapterData = await BibleService.fetchChapter(
          transId,
          book.id,
          selection.chapter,
        );

        const verseContent = chapterData.chapter.content.find(
          (c) => c.type === 'verse' && c.number === selection?.verse,
        ) as BibleService.ChapterVerse;

        if (verseContent) {
          const text = verseContent.content
            .map((item) => {
              if (typeof item === 'string') return item;
              if (typeof item === 'object' && item !== null && 'text' in item)
                return (item as any).text || '';
              return '';
            })
            .join('')
            .replace(/\s+/g, ' ')
            .trim();

          const newVOTD = {
            text: `"${text}"`,
            reference: `${book.name} ${selection.chapter}:${selection.verse}`,
            bookId: book.id,
            chapter: selection.chapter,
            verse: selection.verse,
            dateKey: currentDateKey,
          };
          setRandomVerse(newVOTD);
          await AsyncStorage.setItem(VOTD_CACHE_KEY, JSON.stringify(newVOTD));
        }
      }
    } catch (e) {
      console.warn('Failed to load random verse:', e);
    }
  };

  useEffect(() => {
    loadRandomVerse();
  }, [language]);

  const handleShare = async () => {
    if (!randomVerse) return;
    const transId =
      BibleService.DEFAULT_TRANSLATION_MAP[language as SupportedLanguage] || 'BSB';
    const translation =
      BibleService.SUPPORTED_TRANSLATIONS.find((t) => t.id === transId)?.name || transId;
    const message = `${randomVerse.text}\n\n— ${randomVerse.reference} (${translation})`;

    try {
      if (typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share({
          title: randomVerse.reference,
          text: message,
        });
      } else {
        await Share.share({
          message,
          title: randomVerse.reference,
        });
      }
    } catch (e) {
      if ((e as any).name !== 'AbortError') {
        console.error('Sharing failed', e);
      }
    }
  };

  const navigateToVerse = () => {
    if (!randomVerse) return;
    router.push({
      pathname: '/resources/bible',
      params: {
        bookId: randomVerse.bookId,
        chapter: randomVerse.chapter.toString(),
        q: randomVerse.reference,
        refresh: Date.now().toString(),
        translationId:
          BibleService.DEFAULT_TRANSLATION_MAP[language as SupportedLanguage] || 'BSB',
      },
    } as any);
  };

  return (
    <>
      <ScrollView
        style={NavigationStyles.container}
        contentContainerStyle={{ paddingTop: headerHeight }}
      >
        <ImageBackground
          source={{ uri: CHURCH_BUILDING_IMAGE_URL }}
          style={styles.hero}
          resizeMode="cover"
        >
          <LinearGradient
            colors={theme.gradients.heroOverlay}
            style={StyleSheet.absoluteFill}
          />
          <Text
            variant="headlineMedium"
            style={[styles.welcomeText, { color: '#FFFFFF' }]}
          >
            {labels.welcome}
          </Text>
          <Text
            variant="labelLarge"
            style={{
              color: '#FFFFFF',
              opacity: 0.8,
              marginBottom: 4,
            }}
          >
            {(labels as any).verseOfDay}
          </Text>
          <Text
            variant="titleMedium"
            style={{
              color: '#FFFFFF',
              textAlign: 'center',
              fontStyle: 'italic',
              marginTop: 4,
            }}
          >
            {randomVerse
              ? `${randomVerse.text}\n— ${randomVerse.reference}`
              : labels.subtitle}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 16,
              gap: 12,
              width: '100%',
              paddingHorizontal: 16,
            }}
          >
            <Button
              mode="outlined"
              icon="share-variant"
              onPress={handleShare}
              disabled={!randomVerse}
              style={{ borderRadius: 20, flex: 1, borderColor: '#FFFFFF' }}
              textColor="#FFFFFF"
            >
              {(labels as any).shareVerse}
            </Button>
            <Button
              mode="contained"
              icon="book-open-variant"
              onPress={navigateToVerse}
              disabled={!randomVerse}
              style={{ borderRadius: 20, flex: 1 }}
            >
              {(labels as any).readVerse}
            </Button>
          </View>
        </ImageBackground>

        <List.Section style={NavigationStyles.contentContainer}>
          {/* Sabbath Countdown Widget */}
          <Card
            style={[styles.timerCard, { backgroundColor: theme.colors.surface }]}
            mode="outlined"
          >
            <Card.Content style={styles.timerContentSubtle}>
              <View style={styles.timerRow}>
                <View style={styles.labelColumn}>
                  <Text
                    variant="bodyLarge"
                    style={{ color: theme.colors.onSurface, fontWeight: '600' }}
                  >
                    {isSabbath ? labels.sabbathEnds : labels.sabbathStarts}
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant, opacity: 0.6 }}
                  >
                    {useGps ? labels.locationLocal : labels.locationDefault}
                  </Text>
                </View>

                <Text
                  variant="bodyLarge"
                  style={[
                    styles.timerValueSubtle,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {countdown || '00:00:00'}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <MenuCard
            title={labels.livestream}
            icon="youtube"
            iconColor={(theme.colors as any).brandYoutube}
            onPress={openSabbathStream}
            style={{ marginBottom: 12 }}
          />

          <List.Subheader
            style={[NavigationStyles.subheader, { color: theme.colors.onBackground }]}
          >
            {labels.discover}
          </List.Subheader>

          <MenuCard
            title={labels.aboutSDA}
            icon="information"
            iconColor={theme.colors.tertiary}
            onPress={() =>
              router.push({
                pathname: '/home/about-sda',
                params: { backTo: '/' },
              } as any)
            }
            style={{ marginBottom: 12 }}
          />

          <MenuCard
            title={labels.aboutHistory}
            icon="history"
            iconColor={theme.colors.tertiary}
            onPress={() =>
              router.push({
                pathname: '/home/about-my-church',
                params: { backTo: '/' },
              } as any)
            }
            style={{ marginBottom: 12 }}
          />

          <MenuCard
            title={labels.meetTeam}
            icon="account-multiple"
            iconColor={theme.colors.tertiary}
            onPress={() =>
              router.push({
                pathname: '/home/team',
                params: { backTo: '/' },
              } as any)
            }
            style={{ marginBottom: 12 }}
          />

          <MenuCard
            title={labels.contact}
            icon="church"
            iconColor={theme.colors.tertiary}
            onPress={() =>
              router.push({
                pathname: '/home/contact',
                params: { backTo: '/' },
              } as any)
            }
            style={{ marginBottom: 12 }}
          />

          <MenuCard
            title={labels.join}
            icon="water-outline"
            iconColor={theme.colors.tertiary}
            onPress={() =>
              router.push({
                pathname: '/community/baptism',
                params: { backTo: '/' },
              } as any)
            }
            style={{ marginBottom: 12 }}
          />

          <List.Subheader
            style={[NavigationStyles.subheader, { color: theme.colors.onBackground }]}
          >
            {labels.thisWeek}
          </List.Subheader>

          <MenuCard
            title={labels.bulletin}
            icon="file-document-outline"
            iconColor={theme.colors.tertiary}
            onPress={() =>
              router.push({
                pathname: '/home/bulletin',
                params: { backTo: '/' },
              } as any)
            }
            style={{ marginBottom: 12 }}
          />
          <MenuCard
            title={labels.give}
            icon="gift"
            iconColor={theme.colors.tertiary}
            onPress={() =>
              router.push({
                pathname: '/home/give',
                params: { backTo: '/' },
              } as any)
            }
          />
        </List.Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  welcomeText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  timerCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  timerContentSubtle: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelColumn: {
    flex: 1,
  },
  timerValueSubtle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontVariant: ['tabular-nums'],
    fontSize: 16,
    fontWeight: '700',
  },
});
