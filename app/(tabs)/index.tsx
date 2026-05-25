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
      welcome: 'Welcome to our Church',
      subtitle: 'The Lord is my shepherd; I lack nothing.\nPsalm 23:1',
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
    },
    zh: {
      welcome: '歡迎來到我們的教會',
      subtitle: '耶和華是我的牧者，我必不致缺乏。\n詩篇 23:1',
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
    },
    'zh-cn': {
      welcome: '欢迎来到我们的教会',
      subtitle: '耶和华是我的牧者，我必不致缺乏。\n诗篇 23:1',
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
    },
    es: {
      welcome: 'Bienvenido a nuestra iglesia',
      subtitle: 'Jehová es mi pastor; nada me faltará.\nSalmo 23:1',
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
            {labels.discover}
          </List.Subheader>

          <MenuCard
            title={labels.aboutSDA}
            icon="information"
            iconColor={theme.colors.tertiary}
            onPress={() =>
              router.push({
                pathname: '/home/about_sda',
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
                pathname: '/home/about_my_church',
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
});
