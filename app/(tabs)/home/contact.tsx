import { MenuCard } from '@/components/MenuCard';
import { CHURCH_LOCATIONS, getLocationNames } from '@/constants/ChurchData';
import {
  CHURCH_EMAIL,
  CHURCH_PHONE,
  openEmail,
  openInMaps,
  openPhone,
} from '@/constants/ExternalLinks';
import { LanguageContext } from '@/constants/LanguageContext';
import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { NavigationStyles } from '@/styles/NavigationStyles';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ContactScreen() {
  const { language } = useContext(LanguageContext);
  const { backTo, highlight } = useLocalSearchParams();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const allLabels = {
    en: {
      title: 'Connect with Us',
      addressLabel: 'Locations',
      infoLabel: 'Contact Information',
    },
    zh: {
      title: '聯繫我們',
      addressLabel: '地點',
      infoLabel: '聯絡資訊',
    },
    'zh-cn': {
      title: '联系我们',
      addressLabel: '地点',
      infoLabel: '联系信息',
    },
    es: {
      title: 'Conéctate con Nosotros',
      addressLabel: 'Ubicaciones',
      infoLabel: 'Información de contacto',
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  // Group keywords into categories to avoid brittle if/else chains
  const CATEGORY_KEYWORDS: Record<string, string[]> = {
    email: ['email', '電郵', 'correo'],
    phone: ['phone', 'call', '電話', 'llamar'],
    location: [
      'location',
      'map',
      'direction',
      '地點',
      '地圖',
      '導航',
      'ubicación',
      'mapa',
      'dirección',
      'address',
      '地址',
      '路线',
    ],
  };

  useEffect(() => {
    if (highlight) {
      const q = (highlight as string).toLowerCase();

      // Find the first category that matches any of the keyword synonyms
      const target = Object.keys(CATEGORY_KEYWORDS).find((key) =>
        CATEGORY_KEYWORDS[key].some((keyword) => q.includes(keyword.toLowerCase())),
      );

      if (target) {
        setActiveHighlight(target);
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
          }),
        ]).start(() => {
          setActiveHighlight(null);
          router.setParams({ highlight: undefined });
        });
      }
    }
  }, [highlight]);

  const getHighlightStyle = (key: string) => {
    if (activeHighlight !== key) return {};
    return {
      backgroundColor: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', theme.colors.primaryContainer],
      }),
    };
  };

  return (
    <>
      <Stack.Screen options={{ title: labels.title, backTo } as any} />
      <ScrollView
        style={NavigationStyles.container}
        contentContainerStyle={[
          NavigationStyles.contentContainer,
          { paddingTop: headerHeight },
        ]}
      >
        <List.Section>
          <List.Subheader
            style={[NavigationStyles.subheader, { color: theme.colors.onBackground }]}
          >
            {labels.infoLabel}
          </List.Subheader>
          <MenuCard
            title={CHURCH_PHONE}
            icon="phone"
            iconColor={theme.colors.tertiary}
            rightIcon="open-in-new"
            style={getHighlightStyle('phone')}
            onPress={() => openPhone(CHURCH_PHONE)}
          />
          <MenuCard
            title={CHURCH_EMAIL}
            icon="email"
            iconColor={theme.colors.tertiary}
            rightIcon="open-in-new"
            style={getHighlightStyle('email')}
            onPress={() => openEmail(CHURCH_EMAIL)}
          />
        </List.Section>

        <List.Section>
          <List.Subheader
            style={[NavigationStyles.subheader, { color: theme.colors.onBackground }]}
          >
            {labels.addressLabel}
          </List.Subheader>
          {CHURCH_LOCATIONS.map((loc, index) => (
            <MenuCard
              key={index}
              title={getLocationNames(language)[index]}
              description={loc.address}
              icon={loc.icon}
              iconColor={theme.colors.tertiary}
              rightIcon="open-in-new"
              style={getHighlightStyle('location')}
              onPress={() => openInMaps((loc as any).searchQuery)}
            />
          ))}
        </List.Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({});
