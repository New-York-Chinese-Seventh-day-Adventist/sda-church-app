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
  colors: { ..._LightTheme.colors, primary: "#3EA6FF", background: "#F8F9FA" },
};

export const DarkTheme = {
  ..._DarkTheme,
  colors: { ..._DarkTheme.colors, primary: "#FFFFFF", background: "#0F0F0F" },
};

/**
 * REACT NATIVE PAPER THEMES
 * Logic mapping follows the color mapping in /docs/UI_UX.md.
 * Surface/Background relationships prioritize the 'Hierarchy of Light' (Tenet 5).
 */

export const customLightTheme = {
  ...MD3LightTheme,
  version: 3,
  isV3: true,
  colors: {
    ...MD3LightTheme.colors,
    // Primary: Sanctuary Blue #3EA6FF
    primary: "#3EA6FF", // Primary Interaction Color Accent
    onPrimary: "#F8F9FA", // Inverted Text (The Stencil)
    primaryContainer: "#E3F2FD", // Selection Container
    onPrimaryContainer: "#3EA6FF", // General Iconography

    // Backgrounds & Surfaces
    background: "#F8F9FA", // The Canvas
    onBackground: "#1A1A1A", // The Ink: High-contrast text on Canvas
    surface: "#FFFFFF", // The Object: Cards/Containers
    onSurface: "#1A1A1A", // The Ink: High-contrast text on Surfaces

    // UI Variants & Boundaries
    surfaceVariant: "#F1F3F4", // Secondary UI / Top Search Bar BG
    onSurfaceVariant: "#606060", // Muted Intent: Top Search Bar Icon/Text
    outline: "#CAC4D0", // Boundary (Outline)
    outlineVariant: "#E0E0E0", // Boundary (Subtle) / Divider

    // Tertiary: Identical to Primary in Light Mode for uniform UI color
    tertiary: "#3EA6FF",
    onTertiary: "#FFFFFF",

    // Branding (Special External Brand Colors)
    brandYoutube: "#FF0000",
    brandSpotify: "#1DB954",
  },
  roundness: 3,
};

export const customDarkTheme = {
  ...MD3DarkTheme,
  version: 3,
  isV3: true,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary: Active Focus #FFFFFF (Spotlight Effect)
    primary: "#FFFFFF", // Primary Interaction Color Accent
    onPrimary: "#0F0F0F", // The Stencil / Inverted Text
    primaryContainer: "#2C2C2C", // Selection Container
    onPrimaryContainer: "#FFFFFF", // General Iconography

    // Backgrounds & Surfaces
    background: "#0F0F0F", // The Canvas
    onBackground: "#F5F5F5", // The Ink: Soft White to mitigate Irradiation Illusion
    surface: "#1E1E1E", // The Object: Cards/Containers
    onSurface: "#F5F5F5", // The Ink: Soft White to prevent Halation

    // UI Variants & Boundaries
    surfaceVariant: "#2C2C2C", // Secondary UI
    onSurfaceVariant: "#AAAAAA", // Muted Intent: Top Search Bar Icon/Text
    outline: "#938F99", // Boundary (Outline)
    outlineVariant: "#3F3F3F", // Boundary (Subtle) / Divider

    // Tertiary: Matches Primary (Active Focus) in Dark Mode
    tertiary: "#FFFFFF",
    onTertiary: "#0F0F0F", // Matches Background/Stencil

    // Branding (Standardized Monochrome in Dark Mode)
    brandYoutube: "#FFFFFF",
    brandSpotify: "#FFFFFF",
  },
  roundness: 3,
};
