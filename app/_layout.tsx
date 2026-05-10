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
import { Alert, DevSettings, LogBox, Platform, StyleSheet } from "react-native";
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  Snackbar,
  adaptNavigationTheme,
} from "react-native-paper";
import "react-native-reanimated";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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

/**
 * Context to manage PWA updates across the application.
 */
export const UpdateContext = createContext<{
  updateAvailable: boolean;
  onUpdate: () => void;
  onManualCheck: (options?: { isAuto?: boolean }) => Promise<void>;
  updateStatus: "idle" | "checking" | "up-to-date";
}>({
  updateAvailable: false,
  onUpdate: () => {},
  onManualCheck: async () => {},
  updateStatus: "idle",
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

  const getSwUrl = () => {
    // If your app is at the root, use /sw.js. If hosted on GitHub Pages subpath, use /sda-church-app/sw.js
    return window.location.pathname.includes("sda-church-app")
      ? "/sda-church-app/sw.js"
      : "/sw.js";
  };

  const nuclearRefresh = async () => {
    if (Platform.OS === "web") {
      // If the user is offline, we must NOT clear the caches.
      // Wiping the cache while offline would immediately break the PWA's
      // ability to serve the app on the next reload or lazy-load navigation.
      if (typeof navigator !== "undefined" && !navigator.onLine) return;

      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
        // Bypass HTTP cache for the main entry point to ensure fresh index.html
        await fetch(window.location.href, { cache: "reload" }).catch(() => {});
      } catch (e) {
        console.warn("Update cleanup failed:", e);
      }
    }
  };

  const handleUpdate = async () => {
    await nuclearRefresh();

    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else if (Platform.OS === "web") {
      // Fallback: manually reload if no worker is found but update was requested
      window.location.reload();
    }
    setUpdateAvailable(false);
  };

  const handleManualCheck = async (options?: { isAuto?: boolean }) => {
    if (Platform.OS === "web" && "serviceWorker" in navigator) {
      // Do not attempt to check for updates if we know we are offline.
      if (!navigator.onLine) return;

      // Only show the "Checking..." snackbar for manual clicks to avoid UI noise on launch
      if (!options?.isAuto) {
        setUpdateStatus("checking");
      }

      try {
        const swUrl = getSwUrl();

        // Step 1: Nuclear Refresh (Clear all caches)
        await nuclearRefresh();

        // Step 2: Bypass sw.js cache
        await fetch(swUrl, { cache: "reload" }).catch(() => {});

        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Step 3: Trigger the browser's update check
          await registration.update();

          // Step 4: The Magic Wait - give registration properties time to populate
          await new Promise((resolve) => setTimeout(resolve, 800));

          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setUpdateAvailable(true);
            setUpdateStatus("idle");
            await handleUpdate();
          } else if (registration.installing) {
            const installingWorker = registration.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed") {
                setWaitingWorker(installingWorker);
                setUpdateAvailable(true);
                handleUpdate();
              }
            };
          } else {
            // No update found
            setUpdateAvailable(false);

            if (!options?.isAuto) {
              // For manual clicks, we show success and reload anyway to be safe
              setUpdateStatus("up-to-date");
              setTimeout(() => handleUpdate(), 1200);
            } else {
              // For auto-checks, we just go back to idle to avoid a reload loop
              setUpdateStatus("idle");
            }
          }
        } else {
          setUpdateStatus("idle");
        }
      } catch (e) {
        console.error("Manual update check failed:", e);
        setUpdateStatus("idle");
      }
    }
  };

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
        const swUrl = getSwUrl();

        try {
          // Ensure we start with a clean cache on every app launch to prevent reversions.
          await nuclearRefresh();

          // Bypassing the HTTP cache for the service worker file itself ensures that
          // the browser sees the byte-change immediately on app start. This prevents
          // "reversions" where the app might otherwise load an old cached registration
          // during a cold start/restart.
          await fetch(swUrl, { cache: "reload" }).catch(() => {});

          const registration = await navigator.serviceWorker.register(swUrl, {
            // Ensures the browser checks the network for sw.js instead of its HTTP cache,
            // which is a primary cause of "reversion" issues on cold starts.
            updateViaCache: "none",
          });
          console.log("SW registered with scope:", registration.scope);
          registration.update();

          // 1. Check if there is already an updated worker waiting
          if (registration.waiting) {
            console.log("New SW already waiting. Auto-updating...");
            await nuclearRefresh();
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          // 2. Listen for new updates being found
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.log("New SW content ready. Auto-updating...");
                    nuclearRefresh().then(() => {
                      installingWorker.postMessage({ type: "SKIP_WAITING" });
                    });
                  } else {
                    console.log("SW installed for the first time.");
                  }
                }
              };
            }
          };

          // Check for updates when the app becomes visible again
          const handleVisibilityChange = async () => {
            if (document.visibilityState === "visible") {
              console.log("App resumed - performing freshness check");
              // Force clear cache and fetch index to ensure the update check sees fresh metadata
              await nuclearRefresh();

              const reg = await navigator.serviceWorker.getRegistration();
              if (reg) {
                // If a worker is already waiting (from a previous background check), activate it immediately.
                if (reg.waiting) {
                  reg.waiting.postMessage({ type: "SKIP_WAITING" });
                } else {
                  reg.update().catch(console.error);
                }
              }
            }
          };
          window.addEventListener("visibilitychange", handleVisibilityChange);
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

      // Check both 'complete' and 'interactive' to ensure we start the SW
      // as soon as the browser allows, minimizing the "reversion" window.
      if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
      ) {
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
        // LITERALLY "press" the check for updates button on every app launch
        if (Platform.OS === "web") {
          handleManualCheck({ isAuto: true });
        }
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
    <SafeAreaProvider>
      <LanguageContext.Provider
        value={{ language, setLanguage: handleSetLanguage }}
      >
        <ThemeContext.Provider
          value={{ isDark, toggleTheme: handleToggleTheme }}
        >
          <UpdateContext.Provider
            value={{
              updateAvailable,
              onUpdate: handleUpdate,
              onManualCheck: handleManualCheck,
              updateStatus,
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
    </SafeAreaProvider>
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
  const insets = useSafeAreaInsets();

  const snackbarLabels = {
    en: {
      checking: "Checking for updates...",
      upToDate: "App is up to date",
      available: "Update available",
      refresh: "RESTART",
    },
    zh: {
      checking: "正在檢查更新...",
      upToDate: "應用程式已是最新版本",
      available: "發現新版本",
      refresh: "重啟",
    },
    "zh-cn": {
      checking: "正在检查更新...",
      upToDate: "应用已是最新版本",
      available: "发现新版本",
      refresh: "重启",
    },
    es: {
      checking: "Buscando actualizaciones...",
      upToDate: "La aplicación está actualizada",
      available: "Actualización disponible",
      refresh: "REINICIAR",
    },
  };

  const labels =
    snackbarLabels[language as keyof typeof snackbarLabels] ||
    snackbarLabels.en;

  // Positioning the snackbar at the top avoids conflicts with bottom navigation,
  // gesture indicators, and the software keyboard.
  const topOffset = insets.top + 8;

  return (
    <PaperProvider theme={isDark ? customDarkTheme : customLightTheme}>
      <ThemeProvider value={isDark ? DarkTheme : LightTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        {showSetup && <InitialSetup onComplete={onCompleteSetup} />}

        <Snackbar
          visible={updateStatus !== "idle" || updateAvailable}
          onDismiss={onDismissStatus}
          duration={
            updateStatus === "checking" || updateAvailable
              ? Snackbar.DURATION_INDEFINITE
              : 3000
          }
          wrapperStyle={[
            styles.snackbarWrapper,
            { top: topOffset, bottom: "auto" },
          ]}
          action={
            updateAvailable
              ? {
                  label: labels.refresh,
                  onPress: onUpdate,
                }
              : undefined
          }
        >
          {updateAvailable
            ? labels.available
            : updateStatus === "checking"
              ? labels.checking
              : labels.upToDate}
        </Snackbar>
      </ThemeProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  snackbarWrapper: {
    // Positioned at the top to clear navigation and keyboard
  },
});
