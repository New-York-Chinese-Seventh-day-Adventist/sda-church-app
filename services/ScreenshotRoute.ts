import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The screen to open at the next launch, saved by the key-screen capture
 * (scripts/capture-ios-screens.cjs, #331). The iOS Simulator asks "Open in …?"
 * before following a deep link, and nothing on a build runner can tap that, so
 * the capture saves the screen here and launches the app instead. The app opens
 * it once and forgets it. Only something that can already write the app's
 * private storage can set it.
 */
export const SCREENSHOT_ROUTE_KEY = 'screenshot-route';

/**
 * Turns a saved path such as `bible?bookId=PSA&chapter=23` into an app route,
 * or null if it isn't a plain in-app path.
 */
export const parseScreenshotRoute = (value: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.includes('//') || trimmed.includes('..')) return null;
  const path = trimmed.replace(/^\//, '');
  if (!path) return null;
  if (!/^[A-Za-z0-9/_\-?=&%.]+$/.test(path)) return null;
  return `/${path}`;
};

/** Reads and removes the saved screen, returning its route if there was one. */
export const takeScreenshotRoute = async (): Promise<string | null> => {
  const value = await AsyncStorage.getItem(SCREENSHOT_ROUTE_KEY);
  if (value === null) return null;
  await AsyncStorage.removeItem(SCREENSHOT_ROUTE_KEY);
  return parseScreenshotRoute(value);
};
