import { Stack } from "expo-router";
import React from "react";

export default function MoreStackLayout() {
  return (
    <Stack>
      {/* The index.tsx in this folder will be the default screen for the 'More' tab */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* Screens pushed onto this stack will hide the bottom tab bar */}
      <Stack.Screen name="language" options={{ headerShown: false }} />
      <Stack.Screen name="contact" options={{ headerShown: false }} />
    </Stack>
  );
}
