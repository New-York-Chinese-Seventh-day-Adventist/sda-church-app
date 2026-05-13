import { GlobalHeader } from "@/app/(tabs)/_layout";
import { Stack } from "expo-router";
import React from "react";

export default function ResourcesStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <GlobalHeader {...props} /> }}>
      <Stack.Screen name="index" />
      {/* Bible Reader is a sub-route of Resources */}
      <Stack.Screen name="bible" />
    </Stack>
  );
}
