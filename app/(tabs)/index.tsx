import { GridMenuCard } from '@/components/GridMenuCard';
import { scaleTypographyMetric } from '@/constants/AppPreferences';
import {
  CHURCH_BUILDING_IMAGE_URL,
  CHURCH_LATITUDE,
  CHURCH_LONGITUDE,
  openURL,
  openSabbathStream,
} from '@/constants/ExternalLinks';
import { LanguageContext, SupportedLanguage } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useTextSize } from '@/constants/TextSizeContext';
import { useAppTheme } from '@/constants/Themes';
import * as BibleService from '@/services/BibleService';
import { createSabbathCountdownViewModel } from '@/services/SabbathCountdownViewModel';
import {
  calculateSabbathWindow,
  createSunsetRangeRequest,
  getSunsetApiRangeUrl,
  isSameSunsetLocation,
  normalizeSunsetCoordinates,
  parseSunsetV2Range,
  selectNextSunsetPair,
  selectSunsetLocation,
  SunsetCoordinates,
  SUNSET_LOCATION_PRIVACY_COPY,
  SUNSET_PROVIDER_ATTRIBUTION_URL,
  SUNSET_REQUEST_TIMEOUT_MS,
  SunsetTimesState,
} from '@/services/SunsetLocationPolicy';
import { createNavigationStyles } from '@/styles/NavigationStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ImageBackground,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  List,
  Portal,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ELMHURST_SUNSET_COORDINATES: SunsetCoordinates = Object.freeze({
  lat: CHURCH_LATITUDE,
  lng: CHURCH_LONGITUDE,
});

type LocationRequestStatus = 'default' | 'requesting' | 'local' | 'unavailable';
type SunsetModalState = 'closed' | 'details' | 'location-disclosure';

export default function HomeScreen() {
  const { language } = useContext(LanguageContext);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { textScale } = useTextSize();
  const { fontScale, width: windowWidth } = useWindowDimensions();
  const effectiveTextScale = Math.max(1, fontScale * textScale);
  // Preserve the upstream two-column phone grid at 100%, then stack only
  // when the scaled text would leave each card too narrow to wrap cleanly.
  const useStackedLayout =
    (windowWidth - 48) / 2 < 145 * effectiveTextScale;
  const useCompactHeroLabels = windowWidth < 360 && effectiveTextScale >= 1.75;
  const usesConstrainedTimer = windowWidth < 430 || effectiveTextScale > 1.2;
  const interactiveCursorStyle =
    Platform.OS === 'web' ? ({ cursor: 'pointer' } as ViewStyle) : undefined;
  const styles = useMemo(
    () => createStyles(textScale, effectiveTextScale, useStackedLayout),
    [effectiveTextScale, textScale, useStackedLayout],
  );
  const navigationStyles = useMemo(
    () =>
      createNavigationStyles(textScale, {
        bottomInset: insets.bottom,
        fontScale,
      }),
    [fontScale, insets.bottom, textScale],
  );

  const allLabels = {
    en: {
      welcome: 'Welcome!',
      subtitle: 'Loading daily verse...',
      verseOfDay: 'A word for your unique journey today',
      readVerse: 'Read Verse',
      readVerseCompact: 'Read',
      shareVerse: 'Share Verse',
      shareVerseCompact: 'Share',
      livestream: 'Watch Livestream',
      discover: 'Discover',
      bulletin: 'Weekly Bulletin',
      give: 'Tithe & Offering',
      events: 'Upcoming Events',
      prayer: 'Prayer',
      sabbathStarts: 'Sabbath starts in',
      sabbathEnds: 'Sabbath ends in',
      isSabbath: 'Happy Sabbath!',
      sunsetLoading: 'Loading verified sunset times…',
      sunsetUnavailable: 'Sunset times are unavailable',
      locationLocal: 'Your location',
      locationDefault: 'Elmhurst, NY',
      openSunsetDetails: 'Opens Sabbath sunset details',
      fullscreenReminder:
        'For full screen, swipe down from the top to open notifications, then swipe back up.',
      dismissReminder: 'Got it',
    },
    zh: {
      welcome: '歡迎！',
      subtitle: '正在載入經文...',
      verseOfDay: '今日為您預備的話語',
      readVerse: '查閱經文',
      readVerseCompact: '閱讀',
      shareVerse: '分享經文',
      shareVerseCompact: '分享',
      livestream: '觀看直播',
      discover: '探索',
      bulletin: '每週週報',
      give: '奉獻',
      events: '近期活動',
      prayer: '禱告',
      sabbathStarts: '距離安息日還有',
      sabbathEnds: '距離安息日結束還有',
      isSabbath: '安息日快樂！',
      sunsetLoading: '正在載入經驗證的日落時間…',
      sunsetUnavailable: '目前無法取得日落時間',
      locationLocal: '您的位置',
      locationDefault: '紐約艾姆赫斯特',
      openSunsetDetails: '開啟安息日日落詳情',
      fullscreenReminder: '若要進入全螢幕，請從頂端向下滑開啟通知，再向上滑關閉。',
      dismissReminder: '知道了',
    },
    'zh-cn': {
      welcome: '欢迎！',
      subtitle: '正在载入经文...',
      verseOfDay: '今日为您准备的话语',
      readVerse: '查阅经文',
      readVerseCompact: '阅读',
      shareVerse: '分享经文',
      shareVerseCompact: '分享',
      livestream: '观看直播',
      discover: '探索',
      bulletin: '每周周报',
      give: '奉献',
      events: '近期活动',
      prayer: '祷告',
      sabbathStarts: '距离安息日还有',
      sabbathEnds: '距离安息日结束还有',
      isSabbath: '安息日快乐！',
      sunsetLoading: '正在加载经验证的日落时间…',
      sunsetUnavailable: '目前无法获取日落时间',
      locationLocal: '您的位置',
      locationDefault: '纽约埃尔姆赫斯特',
      openSunsetDetails: '打开安息日日落详情',
      fullscreenReminder: '若要进入全屏，请从顶部向下滑打开通知，再向上滑关闭。',
      dismissReminder: '知道了',
    },
    es: {
      welcome: '¡Bienvenido!',
      subtitle: 'Cargando versículo...',
      verseOfDay: 'Una palabra para tu camino hoy',
      readVerse: 'Leer Versículo',
      readVerseCompact: 'Leer',
      shareVerse: 'Compartir',
      shareVerseCompact: 'Compartir',
      livestream: 'Ver Transmisión',
      discover: 'Descubrir',
      bulletin: 'Boletín Semanal',
      give: 'Diezmos y Ofrendas',
      events: 'Próximos Eventos',
      prayer: 'Oración',
      sabbathStarts: 'El Sábado comienza en',
      sabbathEnds: 'El Sábado termina en',
      isSabbath: '¡Feliz Sábado!',
      sunsetLoading: 'Cargando horas verificadas del atardecer…',
      sunsetUnavailable: 'Las horas del atardecer no están disponibles',
      locationLocal: 'Tu ubicación',
      locationDefault: 'Elmhurst, NY',
      openSunsetDetails: 'Abre los detalles del atardecer del sábado',
      fullscreenReminder:
        'Para usar la pantalla completa, desliza hacia abajo para abrir las notificaciones y luego hacia arriba.',
      dismissReminder: 'Entendido',
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
  const [showFullscreenReminder, setShowFullscreenReminder] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [userCoords, setUserCoords] = useState<SunsetCoordinates | null>(null);
  const geolocationRequestId = useRef(0);
  const sunsetRequestId = useRef(0);
  const expiredSunsetRequestId = useRef<number | null>(null);
  const [sunsetRefreshNonce, setSunsetRefreshNonce] = useState(0);
  const [modalState, setModalState] = useState<SunsetModalState>('closed');
  const [locationStatus, setLocationStatus] =
    useState<LocationRequestStatus>('default');
  const [sunsetState, setSunsetState] = useState<SunsetTimesState>(() => ({
    status: 'loading',
    requestId: 0,
    dateKey: '',
    location: selectSunsetLocation(ELMHURST_SUNSET_COORDINATES, null),
  }));

  const VOTD_CONFIG_KEY = 'votd_selection_config';
  const VOTD_CACHE_KEY = `votd_cache_${language}`;

  const useGps = userCoords !== null;
  const selectedSunsetLocation = selectSunsetLocation(
    ELMHURST_SUNSET_COORDINATES,
    userCoords,
  );
  const sunsetRangeRequest = createSunsetRangeRequest(new Date());
  const sunsetDateKey = `${sunsetRangeRequest.dateStart}:${sunsetRangeRequest.dateEnd}`;
  const sunsetStateMatchesLocation =
    isSameSunsetLocation(sunsetState.location, selectedSunsetLocation) &&
    sunsetState.dateKey === sunsetDateKey;
  const sunsetTimesReady =
    sunsetStateMatchesLocation && sunsetState.status === 'ready';
  const sunsetTimesUnavailable =
    sunsetStateMatchesLocation && sunsetState.status === 'unavailable';
  const sunsetCountdownReady =
    sunsetTimesReady && targetDate !== null && countdown.length > 0;
  const displayedSunsetTimeZone =
    sunsetCountdownReady && sunsetState.status === 'ready' ? sunsetState.tzid : null;
  const displayedSunsetDate =
    sunsetCountdownReady && sunsetState.status === 'ready'
      ? isSabbath
        ? sunsetState.saturdayDate
        : sunsetState.fridayDate
      : null;

  useEffect(() => {
    if (
      Platform.OS !== 'web' ||
      typeof window === 'undefined' ||
      typeof navigator === 'undefined' ||
      !/Android/i.test(navigator.userAgent) ||
      (!window.matchMedia('(display-mode: standalone)').matches &&
        !window.matchMedia('(display-mode: fullscreen)').matches)
    ) {
      return;
    }

    const reminderKey = 'android-fullscreen-reminder-shown-v2';
    if (window.sessionStorage.getItem(reminderKey) === 'done') return;

    // Keep tab changes, back navigation, and app resume from being mistaken for
    // a fresh launch. A new standalone app session receives a new page session.
    window.sessionStorage.setItem(reminderKey, 'done');
    setShowFullscreenReminder(true);
  }, []);

  useEffect(
    () => () => {
      // Browser geolocation has no cancellation handle. Invalidating its generation
      // makes every pending callback inert after unmount.
      geolocationRequestId.current += 1;
    },
    [],
  );

  // The browser permission prompt is reachable only after the English disclosure.
  // Coordinates remain component memory only and are discarded on reload/unmount.
  const requestCurrentLocation = () => {
    setModalState('details');
    const requestId = ++geolocationRequestId.current;

    if (
      Platform.OS !== 'web' ||
      typeof navigator === 'undefined' ||
      !navigator.geolocation
    ) {
      setUserCoords(null);
      setLocationStatus('unavailable');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (geolocationRequestId.current !== requestId) return;
        const coordinates = normalizeSunsetCoordinates(
          position.coords.latitude,
          position.coords.longitude,
        );
        if (!coordinates) {
          setUserCoords(null);
          setLocationStatus('unavailable');
          return;
        }

        setUserCoords(coordinates);
        setLocationStatus('local');
      },
      () => {
        if (geolocationRequestId.current !== requestId) return;
        setUserCoords(null);
        setLocationStatus('unavailable');
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 3600000 },
    );
  };

  const useElmhurstLocation = () => {
    geolocationRequestId.current += 1;
    setUserCoords(null);
    setLocationStatus('default');
  };

  const retrySunsetData = () => {
    expiredSunsetRequestId.current = null;
    setSunsetRefreshNonce((value) => value + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++sunsetRequestId.current;
    const location = selectSunsetLocation(
      ELMHURST_SUNSET_COORDINATES,
      userCoords,
    );
    let didTimeout = false;
    const timeout = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, SUNSET_REQUEST_TIMEOUT_MS);

    setCountdown('');
    setTargetDate(null);
    setIsSabbath(false);
    setSunsetState({
      status: 'loading',
      requestId,
      dateKey: sunsetDateKey,
      location,
    });

    const fetchSunsets = async () => {
      try {
        const response = await fetch(
          getSunsetApiRangeUrl(
            location.coordinates.lat,
            location.coordinates.lng,
            sunsetRangeRequest.dateStart,
            sunsetRangeRequest.dateEnd,
          ),
          {
            signal: controller.signal,
            ...(location.source === 'device' ? { cache: 'no-store' as const } : {}),
          },
        );
        if (!response.ok) {
          throw new Error('Sunset provider returned an unsuccessful response.');
        }

        const payload: unknown = await response.json();
        const verifiedRange = parseSunsetV2Range(
          payload,
          location.coordinates,
          sunsetRangeRequest.expectedDates,
        );
        if (!verifiedRange) {
          throw new Error('Sunset provider returned an invalid range.');
        }
        const pair = selectNextSunsetPair(verifiedRange, new Date());
        if (!pair) {
          throw new Error('Sunset provider returned no valid upcoming pair.');
        }
        if (controller.signal.aborted) {
          throw Object.assign(new Error('Sunset request was cancelled.'), {
            name: 'AbortError',
          });
        }
        if (sunsetRequestId.current !== requestId) return;

        setSunsetState({
          status: 'ready',
          requestId,
          dateKey: sunsetDateKey,
          location,
          fri: pair.fri,
          sat: pair.sat,
          fridayDate: pair.fridayDate,
          saturdayDate: pair.saturdayDate,
          tzid: pair.tzid,
          range: verifiedRange,
        });
        expiredSunsetRequestId.current = null;
      } catch (error) {
        if (controller.signal.aborted && !didTimeout) return;
        if (sunsetRequestId.current !== requestId) return;
        if (didTimeout) console.warn('Sunset request timed out.');
        else console.warn('Failed to fetch verified sunset times:', error);
        setSunsetState({
          status: 'unavailable',
          requestId,
          dateKey: sunsetDateKey,
          location,
        });
      } finally {
        clearTimeout(timeout);
      }
    };

    void fetchSunsets();
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [userCoords, sunsetDateKey, sunsetRefreshNonce]);

  const formatDisplayDate = (dateKey: string) => {
    const [year, month, dayOfMonth] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, dayOfMonth, 12, 0, 0);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };

    if (language === 'en') {
      const day = date.getDate();
      const suffix = (d: number) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
          case 1:
            return 'st';
          case 2:
            return 'nd';
          case 3:
            return 'rd';
          default:
            return 'th';
        }
      };
      const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
      return `${weekday}, ${month} ${day}${suffix(day)}`;
    }
    return new Intl.DateTimeFormat(language, options).format(date);
  };

  const formatTargetDateTime = (date: Date, timeZone: string) => {
    const locale = language === 'zh-cn' ? 'zh-CN' : language === 'zh' ? 'zh-TW' : language;
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone,
      timeZoneName: 'short',
    }).format(date);
  };

  useEffect(() => {
    setCountdown('');
    setTargetDate(null);
    setIsSabbath(false);

    if (!sunsetTimesReady || sunsetState.status !== 'ready') return;

    const updateTimer = () => {
      const now = new Date();
      let window = calculateSabbathWindow(now, sunsetState.fri, sunsetState.sat);

      // The verified range includes the following pair. Advance locally at Saturday
      // sunset and refresh only after that bounded range is exhausted.
      if (!window) {
        const nextPair = selectNextSunsetPair(sunsetState.range, now);
        if (
          nextPair &&
          (nextPair.fridayDate !== sunsetState.fridayDate ||
            nextPair.saturdayDate !== sunsetState.saturdayDate)
        ) {
          window = calculateSabbathWindow(now, nextPair.fri, nextPair.sat);
          if (window) {
            setSunsetState((current) =>
              current.status === 'ready' && current.requestId === sunsetState.requestId
                ? {
                    ...current,
                    fri: nextPair.fri,
                    sat: nextPair.sat,
                    fridayDate: nextPair.fridayDate,
                    saturdayDate: nextPair.saturdayDate,
                    tzid: nextPair.tzid,
                  }
                : current,
            );
          }
        }
      }

      if (!window) {
        setCountdown('');
        setTargetDate(null);
        setIsSabbath(false);
        if (expiredSunsetRequestId.current !== sunsetState.requestId) {
          expiredSunsetRequestId.current = sunsetState.requestId;
          setSunsetRefreshNonce((value) => value + 1);
        }
        return;
      }

      setTargetDate(window.target);
      setIsSabbath(window.isSabbath);

      const diff = window.millisecondsRemaining;
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
  }, [sunsetState, sunsetTimesReady]);

  const countdownStatus = sunsetCountdownReady
    ? 'ready'
    : sunsetTimesUnavailable
      ? 'unavailable'
      : 'loading';
  const locationLabel = useGps ? labels.locationLocal : labels.locationDefault;
  const countdownViewModel = createSabbathCountdownViewModel({
    status: countdownStatus,
    isSabbath,
    countdown,
    dateLabel: displayedSunsetDate ? formatDisplayDate(displayedSunsetDate) : null,
    locationLabel,
    labels: {
      starts: labels.sabbathStarts,
      ends: labels.sabbathEnds,
      loading: labels.sunsetLoading,
      unavailable: labels.sunsetUnavailable,
      openDetailsHint: labels.openSunsetDetails,
    },
    accessibilityLocale:
      language === 'zh' || language === 'zh-cn' || language === 'es'
        ? language
        : 'en',
  });
  const exactTargetDateTime =
    targetDate && displayedSunsetTimeZone
      ? formatTargetDateTime(targetDate, displayedSunsetTimeZone)
      : null;

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

      // 1. Check if we have coordinates (selection) already cached for today.
      // We only use the cache for the "Selection" to ensure we pick the same verse,
      // but we ALWAYS re-render the text from the chapter content to ensure
      // any fixes to the BibleService renderer are applied immediately.
      const cached = await AsyncStorage.getItem(VOTD_CACHE_KEY);
      let selection: { bookId: string; chapter: number; verse: number } | null = null;
      if (cached) {
        const parsed = JSON.parse(cached);
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
          const text = BibleService.renderVerseToPlainText(transId, verseContent);
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
      pathname: '/bible',
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
        style={navigationStyles.container}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        <ImageBackground
          source={{ uri: CHURCH_BUILDING_IMAGE_URL }}
          style={[
            styles.hero,
            {
              paddingTop: insets.top + DESIGN_TOKENS.VIEW_PADDING,
              paddingBottom: 28,
            },
          ]}
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
          <View style={styles.heroActions}>
            <Button
              accessibilityLabel={labels.shareVerse}
              mode="outlined"
              icon="share-variant"
              onPress={handleShare}
              disabled={!randomVerse}
              style={[styles.heroActionButton, { borderColor: '#FFFFFF' }]}
              contentStyle={styles.heroActionButtonContent}
              textColor="#FFFFFF"
            >
              {useCompactHeroLabels ? labels.shareVerseCompact : labels.shareVerse}
            </Button>
            <Button
              accessibilityLabel={labels.readVerse}
              mode="contained"
              icon="book-open-variant"
              onPress={navigateToVerse}
              disabled={!randomVerse}
              style={styles.heroActionButton}
              contentStyle={styles.heroActionButtonContent}
            >
              {useCompactHeroLabels ? labels.readVerseCompact : labels.readVerse}
            </Button>
          </View>
        </ImageBackground>

        <List.Section style={navigationStyles.contentContainer}>
          {showFullscreenReminder && (
            <Card
              style={[
                styles.fullscreenReminder,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
              mode="contained"
            >
              <Card.Content style={styles.fullscreenReminderContent}>
                <List.Icon icon="gesture-swipe-down" color={theme.colors.secondary} />
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.fullscreenReminderText,
                    { color: theme.colors.onSecondaryContainer },
                  ]}
                >
                  {labels.fullscreenReminder}
                </Text>
                <Button compact onPress={() => setShowFullscreenReminder(false)}>
                  {labels.dismissReminder}
                </Button>
              </Card.Content>
            </Card>
          )}

          {/* Sabbath Countdown Widget */}
          <TouchableRipple
            accessibilityRole="button"
            accessibilityLabel={countdownViewModel.accessibilityLabel}
            accessibilityHint={countdownViewModel.accessibilityHint}
            onPress={() => setModalState('details')}
            rippleColor={theme.colors.surfaceVariant}
            style={[
              styles.timerCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outlineVariant,
              },
              interactiveCursorStyle,
            ]}
          >
            <View
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              pointerEvents="none"
              style={[
                styles.timerRow,
                usesConstrainedTimer && styles.timerRowConstrained,
              ]}
            >
              <MaterialCommunityIcons
                name="sun-clock-outline"
                size={DESIGN_TOKENS.ICON_SIZE_FEATURED}
                color={theme.colors.tertiary}
                style={styles.timerIcon}
              />
              <View style={styles.labelColumn}>
                <Text
                  variant="labelMedium"
                  style={{ color: theme.colors.onSurface, fontWeight: '700' }}
                >
                  {countdownViewModel.title}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {countdownViewModel.secondaryText}
                </Text>
              </View>
              <View
                style={[
                  styles.timerValueCluster,
                  usesConstrainedTimer && styles.timerValueClusterConstrained,
                ]}
              >
                <Text
                  style={[
                    styles.timerValueSubtle,
                    {
                      color: sunsetTimesUnavailable
                        ? theme.colors.error
                        : theme.colors.onSurface,
                    },
                  ]}
                >
                  {countdownViewModel.countdownText}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={DESIGN_TOKENS.ICON_SIZE_STANDARD}
                  color={theme.colors.onSurfaceVariant}
                />
              </View>
            </View>
          </TouchableRipple>

          <View style={styles.grid}>
            <GridMenuCard
              title={labels.livestream}
              subtitle={(labels as any).liveNow}
              icon="youtube"
              color={theme.colors.cardBgColors.livestream}
              iconColor={theme.colors.iconColors.livestream}
              onPress={openSabbathStream}
              style={styles.gridCell}
            />
            <GridMenuCard
              title={labels.bulletin}
              icon="newspaper-variant-outline"
              color={theme.colors.cardBgColors.bulletin}
              iconColor={theme.colors.iconColors.bulletin}
              onPress={() =>
                router.push({
                  pathname: '/home/bulletin',
                  params: { backTo: '/' },
                } as any)
              }
              style={styles.gridCell}
            />
            <GridMenuCard
              title={labels.give}
              icon="hand-heart-outline"
              color={theme.colors.cardBgColors.tithe}
              iconColor={theme.colors.iconColors.tithe}
              onPress={() =>
                router.push({
                  pathname: '/home/give',
                  params: { backTo: '/' },
                } as any)
              }
              style={styles.gridCell}
            />
            <GridMenuCard
              title={labels.prayer}
              icon="hands-pray"
              color={theme.colors.cardBgColors.prayer}
              iconColor={theme.colors.iconColors.prayer}
              onPress={() =>
                router.push({
                  pathname: '/home/prayer',
                  params: { backTo: '/' },
                } as any)
              }
              style={styles.gridCell}
            />
            <GridMenuCard
              title={labels.events}
              icon="calendar"
              color={theme.colors.cardBgColors.events}
              iconColor={theme.colors.iconColors.events}
              onPress={() =>
                router.push({
                  pathname: '/home/events',
                  params: { backTo: '/' },
                } as any)
              }
              style={styles.gridCell}
            />
            <GridMenuCard
              title={labels.discover}
              icon="compass"
              color={theme.colors.cardBgColors.discover}
              iconColor={theme.colors.iconColors.discover}
              onPress={() =>
                router.push({
                  pathname: '/home/discover',
                  params: { backTo: '/' },
                } as any)
              }
              style={styles.gridCell}
            />
          </View>
        </List.Section>
      </ScrollView>
      <Portal>
        <Dialog
          visible={modalState === 'details'}
          onDismiss={() => setModalState('closed')}
          style={styles.sunsetDialog}
        >
          <Dialog.Icon icon="sun-clock-outline" />
          <Dialog.Title>
            {`Sabbath sunset details${language === 'en' ? '' : ' (English)'}`}
          </Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView contentContainerStyle={styles.dialogScrollContent}>
              {language !== 'en' && (
                <Text
                  variant="labelMedium"
                  style={[styles.englishOnlyNotice, { color: theme.colors.primary }]}
                >
                  Sunset details and privacy controls are currently available in English.
                </Text>
              )}

              <View style={styles.detailStatusRow}>
                {countdownStatus === 'loading' && (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                )}
                <View style={styles.detailStatusText}>
                  <Text
                    accessibilityLiveRegion="polite"
                    variant="titleMedium"
                    style={{ color: theme.colors.onSurface, fontWeight: '700' }}
                  >
                    {countdownViewModel.title}
                  </Text>
                  {countdownStatus === 'ready' && (
                    <Text
                      variant="headlineSmall"
                      style={[styles.detailCountdown, { color: theme.colors.onSurface }]}
                    >
                      {countdownViewModel.countdownText}
                    </Text>
                  )}
                </View>
              </View>

              {countdownStatus === 'ready' && exactTargetDateTime && (
                <View style={styles.detailFields}>
                  <View style={styles.detailField}>
                    <Text variant="labelLarge" style={styles.detailFieldLabel}>
                      Target sunset
                    </Text>
                    <Text variant="bodyLarge">{exactTargetDateTime}</Text>
                  </View>
                  <View style={styles.detailField}>
                    <Text variant="labelLarge" style={styles.detailFieldLabel}>
                      Location
                    </Text>
                    <Text variant="bodyLarge">{locationLabel}</Text>
                  </View>
                  <View style={styles.detailField}>
                    <Text variant="labelLarge" style={styles.detailFieldLabel}>
                      Time zone
                    </Text>
                    <Text variant="bodyLarge">{displayedSunsetTimeZone}</Text>
                  </View>
                </View>
              )}

              {sunsetTimesUnavailable && (
                <Text
                  accessibilityLiveRegion="polite"
                  variant="bodyMedium"
                  style={[styles.detailMessage, { color: theme.colors.error }]}
                >
                  Verified sunset data could not be loaded. No estimated Sabbath time is
                  shown.
                </Text>
              )}
              {locationStatus === 'requesting' && (
                <Text
                  accessibilityLiveRegion="polite"
                  variant="bodyMedium"
                  style={styles.detailMessage}
                >
                  {SUNSET_LOCATION_PRIVACY_COPY.requesting}
                </Text>
              )}
              {locationStatus === 'unavailable' && (
                <Text
                  accessibilityLiveRegion="polite"
                  variant="bodyMedium"
                  style={[styles.detailMessage, { color: theme.colors.error }]}
                >
                  {SUNSET_LOCATION_PRIVACY_COPY.unavailable}
                </Text>
              )}
              {locationStatus === 'local' && (
                <Text
                  accessibilityLiveRegion="polite"
                  variant="bodyMedium"
                  style={styles.detailMessage}
                >
                  {SUNSET_LOCATION_PRIVACY_COPY.localSession}
                </Text>
              )}

              <View style={styles.detailActions}>
                {countdownViewModel.canRetryProvider && (
                  <Button
                    mode="outlined"
                    icon="refresh"
                    onPress={retrySunsetData}
                    style={styles.detailAction}
                  >
                    Retry sunset data
                  </Button>
                )}
                {Platform.OS === 'web' && (
                  <Button
                    mode="outlined"
                    icon={useGps ? 'map-marker-off-outline' : 'crosshairs-gps'}
                    disabled={locationStatus === 'requesting'}
                    onPress={
                      useGps
                        ? useElmhurstLocation
                        : () => setModalState('location-disclosure')
                    }
                    style={styles.detailAction}
                  >
                    {useGps
                      ? SUNSET_LOCATION_PRIVACY_COPY.resetAction
                      : locationStatus === 'unavailable'
                        ? SUNSET_LOCATION_PRIVACY_COPY.retryAction
                        : SUNSET_LOCATION_PRIVACY_COPY.action}
                  </Button>
                )}
                <Button
                  accessibilityRole="link"
                  mode="text"
                  icon="open-in-new"
                  onPress={() =>
                    openURL(
                      SUNSET_PROVIDER_ATTRIBUTION_URL,
                      'Error',
                      'Could not open Sunrise-Sunset.org.',
                    )
                  }
                  style={styles.detailAction}
                >
                  Data: Sunrise-Sunset.org
                </Button>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setModalState('closed')}>Close</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={modalState === 'location-disclosure'}
          onDismiss={() => setModalState('details')}
          style={styles.sunsetDialog}
        >
          <Dialog.Icon icon="map-marker-radius-outline" />
          <Dialog.Title>{SUNSET_LOCATION_PRIVACY_COPY.title}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView contentContainerStyle={styles.dialogScrollContent}>
              {language !== 'en' && (
                <Text
                  variant="labelMedium"
                  style={[styles.englishOnlyNotice, { color: theme.colors.primary }]}
                >
                  {SUNSET_LOCATION_PRIVACY_COPY.englishOnlyNotice}
                </Text>
              )}
              <Text variant="bodyMedium">
                {SUNSET_LOCATION_PRIVACY_COPY.disclosure}
              </Text>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setModalState('details')}>
              {SUNSET_LOCATION_PRIVACY_COPY.keepDefaultAction}
            </Button>
            <Button mode="contained" onPress={requestCurrentLocation}>
              {SUNSET_LOCATION_PRIVACY_COPY.continueAction}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const createStyles = (
  textScale: Parameters<typeof scaleTypographyMetric>[1],
  effectiveTextScale: number,
  useStackedLayout: boolean,
) => StyleSheet.create({
  hero: {
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  welcomeText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroActions: {
    flexDirection: useStackedLayout ? 'column' : 'row',
    marginTop: 16,
    gap: 12,
    width: '100%',
    paddingHorizontal: 16,
  },
  heroActionButton: {
    borderRadius: 20,
    flex: useStackedLayout ? undefined : 1,
    width: useStackedLayout ? '100%' : undefined,
  },
  heroActionButtonContent: {
    minHeight: Math.ceil(40 + Math.max(0, effectiveTextScale - 1) * 24),
  },
  timerCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    minHeight: 64,
  },
  fullscreenReminder: {
    marginBottom: 12,
    borderRadius: 12,
  },
  fullscreenReminderContent: {
    minHeight: 64,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: useStackedLayout ? 'column' : 'row',
    alignItems: 'center',
  },
  fullscreenReminderText: {
    flex: 1,
    marginLeft: -4,
  },
  timerRow: {
    minHeight: 64,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerRowConstrained: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  timerIcon: {
    marginRight: 12,
  },
  labelColumn: {
    flex: 1,
    minWidth: 0,
  },
  timerValueCluster: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    marginLeft: 12,
  },
  timerValueClusterConstrained: {
    alignSelf: 'stretch',
    flexBasis: '100%',
    justifyContent: 'flex-end',
    marginLeft: 0,
    marginTop: 8,
    paddingLeft: DESIGN_TOKENS.ICON_SIZE_FEATURED + 12,
  },
  timerValueSubtle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontVariant: ['tabular-nums'],
    fontSize: scaleTypographyMetric(16, textScale),
    lineHeight: scaleTypographyMetric(24, textScale),
    fontWeight: '700',
    flexShrink: 0,
  },
  sunsetDialog: {
    alignSelf: 'center',
    maxHeight: '90%',
    maxWidth: 560,
    width: '90%',
  },
  dialogScrollArea: {
    paddingHorizontal: 0,
  },
  dialogScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  englishOnlyNotice: {
    fontWeight: '700',
    marginBottom: 12,
  },
  detailStatusRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  detailStatusText: {
    flex: 1,
  },
  detailCountdown: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    marginTop: 4,
  },
  detailFields: {
    gap: 16,
    marginTop: 20,
  },
  detailField: {
    gap: 2,
  },
  detailFieldLabel: {
    fontWeight: '700',
  },
  detailMessage: {
    marginTop: 16,
  },
  detailActions: {
    gap: 8,
    marginTop: 20,
  },
  detailAction: {
    justifyContent: 'center',
    minHeight: 44,
  },
  dialogActions: {
    flexWrap: 'wrap',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    borderRadius: 0,
  },
  gridCell: {
    flexBasis: useStackedLayout ? '100%' : '47.5%',
    flexGrow: 1,
  },
});
