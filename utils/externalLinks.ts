import { Alert, Linking } from "react-native";

export const openOnlineGiving = async () => {
  const givingLink = process.env.EXPO_PUBLIC_ONLINE_GIVING_LINK;
  if (!givingLink) {
    Alert.alert(
      "Configuration Error",
      "Online giving link is not defined in the .env file.",
    );
    return;
  }
  try {
    await Linking.openURL(givingLink);
  } catch (error) {
    Alert.alert("Error", "Could not open the online giving link.");
    console.error("Linking error:", error);
  }
};
