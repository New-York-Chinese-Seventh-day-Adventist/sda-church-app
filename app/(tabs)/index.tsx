import { MenuCard } from '@/components/MenuCard';
import { CHURCH_BUILDING_IMAGE_URL, openSabbathStream } from '@/constants/ExternalLinks';
import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { NavigationStyles } from '@/styles/NavigationStyles';
import { router } from 'expo-router';
import { useContext } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { List, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { language } = useContext(LanguageContext);
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const allLabels = {
    en: {
      header: 'SDA Church',
      welcome: 'Welcome to our Church',
      subtitle: 'The Lord is my shepherd; I lack nothing.\nPsalm 23:1',
      livestream: 'Watch Livestream',
      about: 'About Us',
      contact: 'Connect with Us',
      explore: 'Explore',
    },
    zh: {
      header: '基督復臨安息日會',
      welcome: '歡迎來到我們的教會',
      subtitle: '耶和華是我的牧者，我必不致缺乏。\n詩篇 23:1',
      livestream: '觀看直播',
      about: '關於我們',
      contact: '聯繫我們',
      explore: '探索',
    },
    'zh-cn': {
      header: '基督复临安息日会',
      welcome: '欢迎来到我们的教会',
      subtitle: '耶和华是我的牧者，我必不致缺乏。\n诗篇 23:1',
      livestream: '观看直播',
      about: '关于我们',
      contact: '联系我们',
      explore: '探索',
    },
    es: {
      header: 'Iglesia Adventista',
      welcome: 'Bienvenido a nuestra iglesia',
      subtitle: 'Jehová es mi pastor; nada me faltará.\nSalmo 23:1',
      livestream: 'Ver Transmisión',
      about: 'Sobre Nosotros',
      contact: 'Conéctate con Nosotros',
      explore: 'Explorar',
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

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
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: theme.colors.surface, opacity: 0.7 },
            ]}
          />
          <Text
            variant="headlineMedium"
            style={[styles.welcomeText, { color: theme.colors.onSurface }]}
          >
            {labels.welcome}
          </Text>
          <Text
            variant="titleMedium"
            style={{
              color: theme.colors.onSurface,
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            {labels.subtitle}
          </Text>
        </ImageBackground>

        <List.Section style={NavigationStyles.contentContainer}>
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
            {labels.explore}
          </List.Subheader>
          <MenuCard
            title={labels.about}
            icon="information"
            iconColor={theme.colors.tertiary}
            onPress={() => router.push('/home/about')}
            style={{ marginBottom: 12 }}
          />

          <MenuCard
            title={labels.contact}
            icon="map-marker"
            iconColor={theme.colors.tertiary}
            onPress={() => router.push('/home/contact')}
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
});
