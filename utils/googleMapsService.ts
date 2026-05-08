import { Alert, Linking } from "react-native";

/**
 * Opens a given address in the Google Maps app or browser.
 * @param address The formatted address string to search for.
 */
export const openInMaps = async (address: string) => {
  if (!address) return;

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  try {
    await Linking.openURL(url);
  } catch (error) {
    Alert.alert("Error", "Could not open Google Maps.");
    console.error("Maps linking error:", error);
  }
};
