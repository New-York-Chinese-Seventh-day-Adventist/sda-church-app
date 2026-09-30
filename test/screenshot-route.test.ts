import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  SCREENSHOT_ROUTE_KEY,
  parseScreenshotRoute,
  takeScreenshotRoute,
} from '@/services/ScreenshotRoute';

describe('saved screen for the key-screen capture', () => {
  it('turns a deep-link path into an app route', () => {
    expect(parseScreenshotRoute('bible?bookId=PSA&chapter=23&translationId=BSB')).toBe(
      '/bible?bookId=PSA&chapter=23&translationId=BSB',
    );
    expect(parseScreenshotRoute('explore/library/egw')).toBe('/explore/library/egw');
    expect(parseScreenshotRoute('/you')).toBe('/you');
    expect(parseScreenshotRoute('bible?backTo=%2F')).toBe('/bible?backTo=%2F');
  });

  it('ignores anything that isn’t a plain in-app path', () => {
    for (const value of [null, '', '   ', 'https://example.com', '//example.com', '../etc', 'you<script>', 'a b']) {
      expect(parseScreenshotRoute(value)).toBeNull();
    }
  });

  it('opens the saved screen once, then forgets it', async () => {
    await AsyncStorage.setItem(SCREENSHOT_ROUTE_KEY, 'explore');
    expect(await takeScreenshotRoute()).toBe('/explore');
    expect(await AsyncStorage.getItem(SCREENSHOT_ROUTE_KEY)).toBeNull();
    expect(await takeScreenshotRoute()).toBeNull();
  });

  it('does nothing on a normal launch', async () => {
    await AsyncStorage.removeItem(SCREENSHOT_ROUTE_KEY);
    expect(await takeScreenshotRoute()).toBeNull();
  });
});
