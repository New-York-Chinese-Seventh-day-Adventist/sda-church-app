import { Stack, useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { GlobalHeader } from "../_layout";

export default function MoreStackLayout() {
  const navigation = useNavigation();

  useEffect(() => {
    // This listener ensures that when the user leaves the "More" tab,
    // the internal stack is reset to the root (the menu).
    const unsubscribe = navigation.addListener("blur", () => {
      // @ts-ignore - popToTop is available on Stack navigators
      if (navigation.canGoBack()) {
        // @ts-ignore
        navigation.popToTop();
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <Stack screenOptions={{ header: (props) => <GlobalHeader {...props} /> }}>
      {/* The index.tsx in this folder will be the default screen for the 'More' tab */}
      <Stack.Screen name="index" />
      {/* Screens pushed onto this stack */}
      <Stack.Screen name="language" />
      <Stack.Screen name="contact" />
    </Stack>
  );
}
