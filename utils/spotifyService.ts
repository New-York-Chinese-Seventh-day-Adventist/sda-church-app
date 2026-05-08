import { Alert, Linking } from "react-native";

const SPOTIFY_PODCAST_URL = process.env.EXPO_PUBLIC_SPOTIFY_PODCAST_URL;

export const openSpotifyPodcast = async () => {
  if (!SPOTIFY_PODCAST_URL) {
    Alert.alert(
      "Configuration Error",
      "Spotify podcast link is not defined in the .env file.",
    );
    return;
  }
  try {
    await Linking.openURL(SPOTIFY_PODCAST_URL);
  } catch (error) {
    Alert.alert("Error", "Could not open the Spotify podcast.");
    console.error("Linking error:", error);
  }
};
