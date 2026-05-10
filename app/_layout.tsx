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
import { createContext, useContext, useEffect, useState } from "react";
import { Alert, DevSettings, LogBox, Platform } from "react-native";
import {
  Button,
  Dialog,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  Portal,
  Snackbar,
  Text,
  adaptNavigationTheme,
} from "react-native-paper";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
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

/**
 * Context to manage PWA updates across the application.
 */
export const UpdateContext = createContext<{
  updateAvailable: boolean;
  onUpdate: () => void;
  onManualCheck: () => Promise<void>;
}>({
  updateAvailable: false,
  onUpdate: () => {},
  onManualCheck: async () => {},
});

export default function RootLayout() {
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANG);
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");
  const [isReady, setIsReady] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<any>(null);
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "checking" | "up-to-date"
  >("idle");

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
      let refreshing = false;
      const registerSW = async () => {
        // If your app is at the root, use /sw.js. If hosted on GitHub Pages subpath, use /sda-church-app/sw.js
        const swUrl = window.location.pathname.includes("sda-church-app")
          ? "/sda-church-app/sw.js"
          : "/sw.js";

        try {
          const registration = await navigator.serviceWorker.register(swUrl);
          console.log("SW registered with scope:", registration.scope);
          registration.update();

          // 1. Check if there is already an updated worker waiting
          if (registration.waiting) {
            console.log("New SW already waiting.");
            setWaitingWorker(registration.waiting);
            setUpdateAvailable(true);
          }

          // 2. Listen for new updates being found
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              setUpdateStatus("checking");
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.log("New SW content fetched and ready.");
                    setWaitingWorker(installingWorker);
                    setUpdateAvailable(true);
                    setUpdateStatus("idle");
                  } else {
                    console.log("SW installed for the first time.");
                  }
                }
              };
            }
          };

          // Check for updates when the app becomes visible again
          const handleFocus = () => registration.update().catch(console.error);
          window.addEventListener("focus", handleFocus);
        } catch (error) {
          console.error("SW registration failed:", error);
        }
      };

      // Refresh the page automatically when the new service worker takes over
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          console.log("New SW activated, reloading...");
          window.location.reload();
        }
      });

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }
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

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else if (Platform.OS === "web") {
      // Fallback: manually reload if no worker is found but update was requested
      window.location.reload();
    }
    setUpdateAvailable(false);
  };

  const handleManualCheck = async () => {
    if (Platform.OS === "web" && "serviceWorker" in navigator) {
      setUpdateStatus("checking");
      try {
        const swUrl = window.location.pathname.includes("sda-church-app")
          ? "/sda-church-app/sw.js"
          : "/sw.js";

        // FORCE a remote check by fetching the SW file with 'reload' cache mode.
        // This bypasses the local HTTP cache and ensures the browser has the latest
        // byte-code for comparison when registration.update() is called.
        await fetch(swUrl, { cache: "reload", mode: "no-cors" }).catch(
          () => {},
        );

        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Triggers the browser's native PWA update check (compares sw.js).
          await registration.update();

          // Give the browser a moment to update properties on the registration object
          // as 'waiting' or 'installing' might not be populated immediately.
          await new Promise((resolve) => setTimeout(resolve, 800));

          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setUpdateAvailable(true);
            setUpdateStatus("idle");
          } else if (!registration.installing && !registration.waiting) {
            // No update was found during registration.update() and no worker is installing.
            setUpdateStatus("up-to-date");
          } else {
            // An update is currently installing; the onupdatefound listener
            // in useEffect will handle showing the dialog once it's finished.
            console.log("Update is being installed...");
            setUpdateStatus("idle");
          }
        }
      } catch (e) {
        console.error("Manual update check failed:", e);
      }
    }
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
        <UpdateContext.Provider
          value={{
            updateAvailable,
            onUpdate: handleUpdate,
            onManualCheck: handleManualCheck,
          }}
        >
          <RootLayoutNav
            showSetup={showSetup}
            onCompleteSetup={onCompleteSetup}
            updateAvailable={updateAvailable}
            onUpdate={handleUpdate}
            updateStatus={updateStatus}
            onDismissStatus={() => setUpdateStatus("idle")}
          />
        </UpdateContext.Provider>
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  );
}

function RootLayoutNav({
  showSetup,
  onCompleteSetup,
  updateAvailable,
  onUpdate,
  updateStatus,
  onDismissStatus,
}: {
  showSetup: boolean;
  onCompleteSetup: () => void;
  updateAvailable: boolean;
  onUpdate: () => void;
  updateStatus: "idle" | "checking" | "up-to-date";
  onDismissStatus: () => void;
}) {
  const { isDark } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    setDialogVisible(updateAvailable);
  }, [updateAvailable]);

  const snackbarLabels = {
    en: { checking: "Checking for updates...", upToDate: "App is up to date" },
    zh: { checking: "正在檢查更新...", upToDate: "應用程式已是最新版本" },
    "zh-cn": { checking: "正在检查更新...", upToDate: "应用已是最新版本" },
    es: {
      checking: "Buscando actualizaciones...",
      upToDate: "La aplicación está actualizada",
    },
  };

  const labels =
    snackbarLabels[language as keyof typeof snackbarLabels] ||
    snackbarLabels.en;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={isDark ? customDarkTheme : customLightTheme}>
        <ThemeProvider value={isDark ? DarkTheme : LightTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          {showSetup && <InitialSetup onComplete={onCompleteSetup} />}

          <Portal>
            <Dialog
              visible={dialogVisible}
              onDismiss={() => setDialogVisible(false)}
            >
              <Dialog.Title>Update Available</Dialog.Title>
              <Dialog.Content>
                <Text variant="bodyMedium">
                  A new version of the app is ready with the latest features and
                  fixes. Would you like to update now?
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => setDialogVisible(false)}>Later</Button>
                <Button onPress={onUpdate}>Update Now</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>

          <Snackbar
            visible={updateStatus !== "idle"}
            onDismiss={onDismissStatus}
            duration={
              updateStatus === "checking" ? Snackbar.DURATION_INDEFINITE : 3000
            }
          >
            {updateStatus === "checking" ? labels.checking : labels.upToDate}
          </Snackbar>
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
