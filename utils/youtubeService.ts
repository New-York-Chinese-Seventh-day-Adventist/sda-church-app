import { Alert, Linking } from "react-native";

const CHANNEL_HANDLE = process.env.EXPO_PUBLIC_YOUTUBE_CHANNEL_HANDLE;

/**
 * Returns the YouTube channel's "Streams" tab URL.
 * This allows users to manually select the most recent livestream.
 */
export const getLivestreamUrl = (): string => {
  return `https://www.youtube.com/@${CHANNEL_HANDLE}/streams`;
};

export const openSabbathStream = async () => {
  const url = getLivestreamUrl();
  try {
    await Linking.openURL(url);
  } catch (error) {
    Alert.alert("Error", "Could not open the YouTube livestream.");
    console.error("Linking error:", error);
  }
};
