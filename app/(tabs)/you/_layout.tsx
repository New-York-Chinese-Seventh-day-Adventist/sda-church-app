import { GlobalHeader } from "@/app/(tabs)/_layout";
import { Stack } from "expo-router";
import React from "react";

export default function YouStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <GlobalHeader {...props} /> }}>
      {/* The index.tsx in this folder will be the default screen for the 'You' tab */}
      <Stack.Screen name="index" />
      {/* Screens pushed onto this stack */}
      <Stack.Screen name="language" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
