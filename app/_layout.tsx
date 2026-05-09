import { InitialSetup } from "@/components/InitialSetup";
import { useColorScheme } from "@/components/useColorScheme";
import {
  DEFAULT_LANG,
  LanguageContext,
  SupportedLanguage,
  ThemeContext,
} from "@/constants/Contexts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Localization from "expo-localization";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useContext, useEffect, useState } from "react";
import { Alert, DevSettings, LogBox, Platform } from "react-native";
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

// Suppress all warning logs in the UI
LogBox.ignoreAllLogs();

export const unstable_settings = {
  // Ensure that reloading on `/language` keeps a back button present.
  initialRouteName: "(tabs)",
};

const getSystemLanguage = (): SupportedLanguage => {
  const locales = Localization.getLocales();
  if (!locales || locales.length === 0) return DEFAULT_LANG;

  const { languageCode, scriptCode, languageTag } = locales[0];

  if (languageCode === "zh") {
    // Map Chinese variants (Simplified vs Traditional)
    if (scriptCode === "Hans" || languageTag.toLowerCase().includes("cn")) {
      return "zh-cn";
    }
    return "zh";
  }
  if (languageCode === "es") return "es";
  return "en";
};

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
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANG);
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");
  const [isReady, setIsReady] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    // Register a debug menu item to reset onboarding without wiping app data (or your WSL IP)
    if (__DEV__ && Platform.OS !== "web") {
      DevSettings.addMenuItem("Debug: Reset Onboarding", async () => {
        await AsyncStorage.multiRemove([
          "has-completed-setup",
          "user-language",
          "user-theme",
        ]);
        Alert.alert(
          "Onboarding Reset",
          "The first-time flag has been cleared. Reload the app (press 'r' in terminal or use the dev menu) to see the setup screen again.",
          [{ text: "OK" }],
        );
      });
    }

    // Register service worker for PWA support on web
    if (Platform.OS === "web" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sda-church-app/sw.js")
          .catch((error) => {
            console.warn("Service Worker registration failed:", error);
          });
      });
    }

    async function prepare() {
      try {
        const [savedLang, savedTheme, setupDone] = await Promise.all([
          AsyncStorage.getItem("user-language"),
          AsyncStorage.getItem("user-theme"),
          AsyncStorage.getItem("has-completed-setup"),
        ]);

        // Always determine fallbacks first
        const systemLang = getSystemLanguage();
        const systemThemeIsDark = colorScheme === "dark";

        // Use saved settings if they exist, otherwise fallback to system defaults
        setLanguage((savedLang as SupportedLanguage) || systemLang);
        setIsDark(savedTheme ? savedTheme === "dark" : systemThemeIsDark);

        if (setupDone !== "true") {
          setShowSetup(true);
        }
      } catch (e) {
        console.warn("Failed to load settings", e);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  const handleSetLanguage = async (lang: SupportedLanguage) => {
    setLanguage(lang);
    await AsyncStorage.setItem("user-language", lang);
  };

  const handleToggleTheme = async (val?: any) => {
    let next: boolean;
    if (typeof val === "boolean") {
      next = val;
    } else if (typeof val === "string") {
      next = val === "dark";
    } else {
      next = !isDark;
    }
    setIsDark(next);
    await AsyncStorage.setItem("user-theme", next ? "dark" : "light");
  };

  const onCompleteSetup = async () => {
    // Persist current settings when completing setup to ensure they stick on reload
    // even if the user didn't explicitly change them from system defaults.
    await Promise.all([
      AsyncStorage.setItem("has-completed-setup", "true"),
      AsyncStorage.setItem("user-language", language),
      AsyncStorage.setItem("user-theme", isDark ? "dark" : "light"),
    ]);
    setShowSetup(false);
  };

  const [loaded, error] = useFonts({
    AdventSans: require("./../assets/fonts/AdventSans-Logo.otf"),
    "material-community": require("../assets/fonts/MaterialCommunityIcons.ttf"),
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
    if (loaded && isReady) {
      // Optional: Add a very small delay if the transition feels too abrupt
      const timeout = setTimeout(() => SplashScreen.hideAsync(), 200);
      return () => clearTimeout(timeout);
    }
  }, [loaded, isReady]);

  if (!loaded || !isReady) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage }}
    >
      <ThemeContext.Provider value={{ isDark, toggleTheme: handleToggleTheme }}>
        <RootLayoutNav
          showSetup={showSetup}
          onCompleteSetup={onCompleteSetup}
        />
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  );
}

function RootLayoutNav({
  showSetup,
  onCompleteSetup,
}: {
  showSetup: boolean;
  onCompleteSetup: () => void;
}) {
  const { isDark } = useContext(ThemeContext);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={isDark ? customDarkTheme : customLightTheme}>
        <ThemeProvider value={isDark ? DarkTheme : LightTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          {showSetup && <InitialSetup onComplete={onCompleteSetup} />}
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
