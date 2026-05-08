import { useColorScheme } from "@/components/useColorScheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { createContext, useContext, useEffect, useState } from "react";
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  adaptNavigationTheme,
} from "react-native-paper";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/language` keeps a back button present.
  initialRouteName: "(tabs)",
};

const DEFAULT_LANG = process.env.EXPO_PUBLIC_DEFAULT_LANGUAGE || "en";

// Simple Language Context
export const LanguageContext = createContext({
  language: DEFAULT_LANG,
  setLanguage: (lang: string) => {},
});

// Theme Context to manage manual overrides
export const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

// Adapt themes for React Navigation compatibility
const { LightTheme: _LightTheme, DarkTheme: _DarkTheme } = adaptNavigationTheme(
  {
    reactNavigationLight: NavDefaultTheme,
    reactNavigationDark: NavDarkTheme,
  },
);

// Explicitly override navigation primary colors to match our brand blue.
// Otherwise, React Navigation defaults to the Material 3 standard (purple).
const LightTheme = {
  ..._LightTheme,
  colors: { ..._LightTheme.colors, primary: "#0061A4" },
};
const DarkTheme = {
  ..._DarkTheme,
  colors: { ..._DarkTheme.colors, primary: "#A1C9FF" },
};

const customLightTheme = {
  ...MD3LightTheme,
  version: 3,
  isV3: true,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: "#0061A4",
    onPrimary: "#FFFFFF",
    primaryContainer: "#D1E4FF",
    onPrimaryContainer: "#001D36",
  },
  roundness: 3,
};
const customDarkTheme = {
  ...MD3DarkTheme,
  version: 3,
  isV3: true,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: "#A1C9FF",
    onPrimary: "#003258",
    primaryContainer: "#00497D",
    onPrimaryContainer: "#D1E4FF",
  },
  roundness: 3,
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [language, setLanguage] = useState(DEFAULT_LANG);
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      // Even if fonts fail, we should eventually hide the splash screen
      SplashScreen.hideAsync();
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Optional: Add a very small delay if the transition feels too abrupt
      const timeout = setTimeout(() => SplashScreen.hideAsync(), 200);
      return () => clearTimeout(timeout);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <RootLayoutNav />
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  );
}

function RootLayoutNav() {
  const { isDark } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={isDark ? customDarkTheme : customLightTheme}>
        <ThemeProvider value={isDark ? DarkTheme : LightTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
