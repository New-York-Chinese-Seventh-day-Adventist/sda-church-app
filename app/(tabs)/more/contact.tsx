import React, { useContext } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { List, useTheme } from "react-native-paper";
import { WebView } from "react-native-webview"; // This import is fine
import { LanguageContext } from "../../_layout"; // Corrected path to root _layout

export default function ContactScreen() {
  const { language } = useContext(LanguageContext);
  const theme = useTheme();
  const address = process.env.EXPO_PUBLIC_CHURCH_ADDRESS;
  const phone = process.env.EXPO_PUBLIC_CHURCH_PHONE;
  const email = process.env.EXPO_PUBLIC_CHURCH_EMAIL;

  const labels = {
    en: {
      title: "Contact Us",
      addressLabel: "Church Address",
      infoLabel: "Contact Information",
    },
    zh: { title: "聯絡我們", addressLabel: "教會地址", infoLabel: "聯絡資訊" },
    "zh-cn": {
      title: "联系我们",
      addressLabel: "教会地址",
      infoLabel: "联系信息",
    },
    es: {
      title: "Contáctenos",
      addressLabel: "Dirección de la iglesia",
      infoLabel: "Información de contacto",
    },
  }[language as "en" | "zh" | "zh-cn" | "es"] || {
    title: "Contact Us",
    addressLabel: "Address",
    infoLabel: "Contact Info",
  };

  const openInMaps = () => {
    if (address) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      );
    }
  };

  return (
    <View style={styles.container}>
      <List.Section>
        <List.Subheader>{labels.infoLabel}</List.Subheader>
        {phone && (
          <List.Item
            title={phone}
            left={(props) => (
              <List.Icon {...props} icon="phone" color={theme.colors.primary} />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() =>
              Linking.openURL(`tel:${phone.replace(/[^\d+]/g, "")}`)
            }
          />
        )}
        {email && (
          <List.Item
            title={email}
            left={(props) => (
              <List.Icon {...props} icon="email" color={theme.colors.primary} />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Linking.openURL(`mailto:${email}`)}
          />
        )}
      </List.Section>

      <List.Section>
        <List.Subheader>{labels.addressLabel}</List.Subheader>
        <List.Item
          title={address}
          titleNumberOfLines={3}
          left={(props) => (
            <List.Icon
              {...props}
              icon="map-marker"
              color={theme.colors.primary}
            />
          )}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={openInMaps}
        />
      </List.Section>

      <View style={styles.mapContainer}>
        <WebView
          style={styles.map}
          originWhitelist={["*"]}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          sharedCookiesEnabled={true}
          onShouldStartLoadWithRequest={(request) => {
            // Intercept non-http(s) schemes like intent:// on Android to prevent ERR_UNKNOWN_URL_SCHEME
            if (
              !request.url.startsWith("http://") &&
              !request.url.startsWith("https://") &&
              !request.url.startsWith("about:blank")
            ) {
              Linking.openURL(request.url).catch(() => {});
              return false;
            }
            return true;
          }}
          source={{
            uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "")}`,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  mapContainer: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
});
