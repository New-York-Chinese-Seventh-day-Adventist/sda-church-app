import { GlobalHeader } from "@/app/(tabs)/_layout";
import { Stack } from "expo-router";
import React from "react";

export default function CommunityStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <GlobalHeader {...props} /> }}>
      <Stack.Screen name="index" />
      {/* Add other community sub-pages here if needed */}
    </Stack>
  );
}
