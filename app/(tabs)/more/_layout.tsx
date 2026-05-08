import { Stack } from "expo-router";
import React from "react";
import { GlobalHeader } from "../_layout";

export default function MoreStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <GlobalHeader {...props} /> }}>
      {/* The index.tsx in this folder will be the default screen for the 'More' tab */}
      <Stack.Screen name="index" />
      {/* Screens pushed onto this stack */}
      <Stack.Screen name="language" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
