import { MenuCard } from "@/components/MenuCard";
import { LanguageContext } from "@/constants/Contexts";
import { DESIGN_TOKENS } from "@/constants/Layout";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { List, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { openInMaps } from "../../../utils/googleMapsService";

export default function ContactScreen() {
  const { language } = useContext(LanguageContext);
  const { backTo, highlight } = useLocalSearchParams();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const locations = [
    {
      // TODO: Replace with your own church addresses, starting with primary branch if multiple
      // address: "123 Church St, City, State, Zip Code",
      address: "76-06 41st Ave, Elmhurst, Queens, NY 11373",
      icon: "church" as const,

      // Google Maps can have conflicting entries for addresses
      // Searching by specific name provides more accurate results.
      // Search query must be in standard Google Maps format (e.g. no floor numbers, room numbers)
      searchQuery: "New York Chinese Seventh-day Adventist Church",
    },
    {
      address: "53-18 4th Ave (3F), Brooklyn, NY 11220",
      searchQuery: "53-18 4th Ave, Brooklyn, NY 11220",
      icon: "church" as const,
    },
    {
      address: "143-11 Willets Point Blvd, Whitestone, Queens, NY 11357",
      icon: "church" as const,
      searchQuery:
        "New York Theological Education Center - Chinese Online School of Theology",
    },
  ];
  const phone = process.env.EXPO_PUBLIC_CHURCH_PHONE;
  const email = process.env.EXPO_PUBLIC_CHURCH_EMAIL;

  const allLabels = {
    en: {
      title: "Connect with Us",
      addressLabel: "Locations",
      locationNames: [
        // TODO: Please ensure translations below are updated accordingly
        "Elmhurst SDA Church",
        "Brooklyn SDA Church (Bay Ridge)",
        "Flushing Fellowship (Mandarin)",
      ],
      infoLabel: "Contact Information",
    },
    zh: {
      title: "聯繫我們",
      addressLabel: "地點",
      locationNames: [
        "艾姆赫斯特教會",
        "布魯克林教會 (Bay Ridge)",
        "法拉盛團契 (晚餐與靈修) (國語)",
      ],
      infoLabel: "聯絡資訊",
    },
    "zh-cn": {
      title: "联系我们",
      addressLabel: "地点",
      locationNames: [
        "艾姆赫斯特教会",
        "布鲁克林教会 (Bay Ridge)",
        "法拉盛团契 (晚餐与灵修) (国语)",
      ],
      infoLabel: "联系信息",
    },
    es: {
      title: "Conéctate con Nosotros",
      addressLabel: "Ubicaciones",
      locationNames: [
        "Iglesia de Elmhurst",
        "Iglesia de Brooklyn (Bay Ridge)",
        "Compañerismo en Flushing (Cena y Devoción) (Mandarín)",
      ],
      infoLabel: "Información de contacto",
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  // Group keywords into categories to avoid brittle if/else chains
  const CATEGORY_KEYWORDS: Record<string, string[]> = {
    email: ["email", "電郵", "correo"],
    phone: ["phone", "call", "電話", "llamar"],
    location: [
      "location",
      "map",
      "direction",
      "地點",
      "地圖",
      "導航",
      "ubicación",
      "mapa",
      "dirección",
      "address",
      "地址",
      "路线",
    ],
  };

  useEffect(() => {
    if (highlight) {
      const q = (highlight as string).toLowerCase();

      // Find the first category that matches any of the keyword synonyms
      const target = Object.keys(CATEGORY_KEYWORDS).find((key) =>
        CATEGORY_KEYWORDS[key].some((keyword) =>
          q.includes(keyword.toLowerCase()),
        ),
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
        outputRange: ["transparent", theme.colors.primaryContainer],
      }),
    };
  };

  return (
    <>
      <Stack.Screen options={{ title: labels.title, backTo } as any} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: headerHeight }}
      >
        <List.Section>
          <List.Subheader>{labels.infoLabel}</List.Subheader>
          {phone && (
            <MenuCard
              title={phone}
              icon="phone"
              iconColor={theme.colors.primary}
              rightIcon="open-in-new"
              style={getHighlightStyle("phone")}
              onPress={async () => {
                const cleanedPhone = phone.replace(/[^\d+]/g, "");
                // telprompt is iOS-only. It shows a confirmation dialog and returns to the app.
                // Android only supports the standard tel: scheme.
                const url =
                  Platform.OS === "ios"
                    ? `telprompt:${cleanedPhone}`
                    : `tel:${cleanedPhone}`;
                try {
                  // Direct attempt is more reliable on Android 11+ as canOpenURL
                  // requires specific manifest queries to return true.
                  await Linking.openURL(url);
                } catch (error) {
                  console.warn("Phone call attempt failed:", error);
                  Alert.alert(
                    "Error",
                    "Phone calls are not supported on this device or emulator.",
                  );
                }
              }}
            />
          )}
          {email && (
            <MenuCard
              title={email}
              icon="email"
              iconColor={theme.colors.primary}
              rightIcon="open-in-new"
              style={getHighlightStyle("email")}
              onPress={async () => {
                const url = `mailto:${email}`;
                try {
                  await Linking.openURL(url);
                } catch (error) {
                  console.warn("Email attempt failed:", error);
                  Alert.alert(
                    "Error",
                    "Email is not configured on this device or emulator.",
                  );
                }
              }}
            />
          )}
        </List.Section>

        <List.Section>
          <List.Subheader
            style={[styles.subheader, { color: theme.colors.primary }]}
          >
            {labels.addressLabel}
          </List.Subheader>
          {locations.map((loc, index) => (
            <MenuCard
              key={index}
              title={labels.locationNames[index]}
              description={loc.address}
              icon={loc.icon}
              iconColor={theme.colors.primary}
              rightIcon="open-in-new"
              style={getHighlightStyle("location")}
              onPress={() => openInMaps((loc as any).searchQuery)}
            />
          ))}
        </List.Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subheader: {
    fontWeight: "bold",
  },
});
