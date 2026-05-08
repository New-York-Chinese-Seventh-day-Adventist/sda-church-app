import { Stack, useLocalSearchParams } from "expo-router";
import React, { useContext } from "react";
import { Alert, Linking, Platform, ScrollView, StyleSheet } from "react-native";
import { List, useTheme } from "react-native-paper";
import { LanguageContext } from "../../_layout"; // Corrected path to root _layout

export default function ContactScreen() {
  const { language } = useContext(LanguageContext);
  const { backTo } = useLocalSearchParams();
  const theme = useTheme();
  const locations = [
    {
      // address: "123 Church St, City, State, Zip Code",
      // TODO: Replace with your own primary church address
      address: "7606 41st Ave, Elmhurst, NY 11373",
      icon: "church" as const,
    },
    {
      // TODO: Replace with your own secondary branch church address
      // Note: This must be in standard Google Maps format. Do not include specific floors or room numbers.
      address: "5318 4th Ave, Brooklyn, NY 11220",
      icon: "church" as const,
    },
    {
      address: "143-11 Willets Point Blvd, Whitestone, NY 11357",
      icon: "church" as const,
    },
  ];
  const phone = process.env.EXPO_PUBLIC_CHURCH_PHONE;
  const email = process.env.EXPO_PUBLIC_CHURCH_EMAIL;

  const allLabels = {
    en: {
      title: "Connect with Us",
      addressLabel: "Locations",
      locationNames: [
        // TODO: Replace with your addresses. You may add specific floors or room numbers if you wish.
        // Please ensure translations below are updated accordingly if you change these.
        "Elmhurst SDA Church (Main)",
        "Brooklyn SDA Church (Bay Ridge, 3rd Floor)",
        "Flushing Outreach (Fellowship & Food Pantry)",
      ],
      infoLabel: "Contact Information",
    },
    zh: {
      title: "聯繫我們",
      addressLabel: "地點",
      locationNames: [
        "艾姆赫斯特教會 (主堂)",
        "布魯克林教會 (Bay Ridge, 3 樓)",
        "法拉盛事工 (團契與食品發放)",
      ],
      infoLabel: "聯絡資訊",
    },
    "zh-cn": {
      title: "联系我们",
      addressLabel: "地点",
      locationNames: [
        "艾姆赫斯特教会 (主堂)",
        "布鲁克林教会 (Bay Ridge, 3 楼)",
        "法拉盛事工 (团契与食品发放)",
      ],
      infoLabel: "联系信息",
    },
    es: {
      title: "Conéctate con Nosotros",
      addressLabel: "Ubicaciones",
      locationNames: [
        "Iglesia de Elmhurst (Principal)",
        "Iglesia de Brooklyn (Bay Ridge, 3er Piso)",
        "Alcance en Flushing (Compañerismo y Despensa de Alimentos)",
      ],
      infoLabel: "Información de contacto",
    },
  };

  const labels = allLabels[language as keyof typeof allLabels] || allLabels.en;

  const openInMaps = (addr: string) => {
    if (addr) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`,
      );
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: labels.title, backTo } as any} />
      <ScrollView style={styles.container}>
        <List.Section>
          <List.Subheader>{labels.infoLabel}</List.Subheader>
          {phone && (
            <List.Item
              title={phone}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="phone"
                  color={theme.colors.primary}
                />
              )}
              right={(props) => <List.Icon {...props} icon="open-in-new" />}
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
            <List.Item
              title={email}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="email"
                  color={theme.colors.primary}
                />
              )}
              right={(props) => <List.Icon {...props} icon="open-in-new" />}
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
          <List.Subheader>{labels.addressLabel}</List.Subheader>
          {locations.map((loc, index) => (
            <List.Item
              key={index}
              title={loc.address}
              description={labels.locationNames[index]}
              titleNumberOfLines={3}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={loc.icon}
                  color={theme.colors.primary}
                />
              )}
              right={(props) => <List.Icon {...props} icon="open-in-new" />}
              onPress={() => openInMaps(loc.address)}
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
  },
});
