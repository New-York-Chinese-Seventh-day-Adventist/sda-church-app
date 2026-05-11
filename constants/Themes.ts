import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
} from "@react-navigation/native";
import {
  MD3DarkTheme,
  MD3LightTheme,
  adaptNavigationTheme,
} from "react-native-paper";

/**
 * Material Design 3 Theme definitions for both React Native Paper and React Navigation.
 * This ensures a cohesive "Digital Sanctuary" across the entire application.
 *
 * Ref: https://m3.material.io/styles/color/the-color-system/tokens
 * Ref: https://callstack.github.io/react-native-paper/docs/guides/theming
 */

// Adapt themes for React Navigation compatibility
const { LightTheme: _LightTheme, DarkTheme: _DarkTheme } = adaptNavigationTheme(
  {
    reactNavigationLight: NavDefaultTheme,
    reactNavigationDark: NavDarkTheme,
  },
);

/**
 * REACT NAVIGATION THEMES (System Chrome)
 *
 * These objects are passed to React Navigation's <ThemeProvider />.
 * They control the "Chrome" of the app:
 * - The Stack Header background and title colors.
 * - The Bottom Tab Bar container and active icon tints.
 * - The initial background color seen during screen transitions.
 *
 * We explicitly override 'primary' and 'background' here. Without this,
 * navigation elements would default to MD3 Purple instead of our Brand Blue.
 */
export const LightTheme = {
  ..._LightTheme,
  colors: { ..._LightTheme.colors, primary: "#3056D3", background: "#F8F9FA" },
};

export const DarkTheme = {
  ..._DarkTheme,
  colors: { ..._DarkTheme.colors, primary: "#5E7BCB", background: "#121212" },
};

/**
 * REACT NATIVE PAPER THEMES (Component Content)
 *
 * These objects are passed to <PaperProvider /> and follow the full MD3 spec.
 * They control internal component logic: Buttons, Cards, Dialogs, and Text.
 *
 * We spread the Navigation colors into these themes to ensure color tokens
 * like 'primary' are identical across both the Chrome and the Content.
 */
export const customLightTheme = {
  ...MD3LightTheme,
  version: 3,
  isV3: true,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: "#3056D3", // Lapis Blue (Spec)
    onPrimary: "#FFFFFF", // Inverted Text (Spec)
    primaryContainer: "#E3F2FD", // Selection Container (Spec)
    onPrimaryContainer: "#3056D3", // Lapis Blue (Spec)
    secondaryContainer: "#F1F3F4", // Top Search Bar Background (Spec)
    onSecondaryContainer: "#1A1A1A", // Core Content Text (Spec)
    background: "#F8F9FA", // Background (Spec)
    surface: "#FFFFFF", // Surface (Spec)
    surfaceVariant: "#F1F3F4", // Surface Variant (Spec)
    onSurface: "#1A1A1A", // Core Content Text (Spec)
    onSurfaceVariant: "#606060", // Top Search Bar Icon/Text (Spec)
    outline: "#CAC4D0", // Boundary (Outline) (Spec)
    outlineVariant: "#E0E0E0", // Boundary (Subtle) (Spec)
    tertiary: "#3EA6FF", // Sanctuary Blue (Spec)
    onTertiary: "#FFFFFF", // Inverted Text (Spec)
    onBackground: "#0F0F0F", // Bottom Tab Bar (Spec)
    brandYoutube: "#FF0000", // YouTube Brand (Spec)
    brandSpotify: "#1DB954", // Spotify Brand (Spec)
  },
  roundness: 3,
};

export const customDarkTheme = {
  ...MD3DarkTheme,
  version: 3,
  isV3: true,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: "#5E7BCB", // Steel Blue (Spec)
    onPrimary: "#121212", // Inverted Text (Spec)
    primaryContainer: "#2C2C2C", // Selection Container (Spec)
    onPrimaryContainer: "#5E7BCB", // Steel Blue (Spec)
    secondaryContainer: "#1E1E1E", // Top Search Bar Background (Spec)
    onSecondaryContainer: "#F5F5F5", // Core Content Text (Spec)
    background: "#121212", // Background (Spec)
    surface: "#1E1E1E", // Surface (Spec)
    surfaceVariant: "#2C2C2C", // Surface Variant (Spec)
    onSurface: "#F5F5F5", // Core Content Text (Spec)
    onSurfaceVariant: "#AAAAAA", // Top Search Bar Icon/Text (Spec)
    outline: "#938F99", // Boundary (Outline) (Spec)
    outlineVariant: "#333333", // Boundary (Subtle) (Spec)
    tertiary: "#FFFFFF", // Sanctuary Blue (Spec)
    onTertiary: "#121212", // Inverted Text (Spec)
    onBackground: "#FFFFFF", // Bottom Tab Bar (Spec)
    brandYoutube: "#FFFFFF", // YouTube Brand (Spec)
    brandSpotify: "#FFFFFF", // Spotify Brand (Spec)
  },
  roundness: 3,
};
