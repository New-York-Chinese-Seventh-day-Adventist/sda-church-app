import { createDocumentStyles } from '@/styles/DocumentStyles';
import { getGlobalHeaderHeightForScale } from '@/hooks/useGlobalHeaderHeight';
import { getBottomTabContentHeight } from '@/constants/Layout';
import { createNavigationStyles } from '@/styles/NavigationStyles';
import {
  createReaderStyles,
  getBibleDockLayout,
  getBibleDockViewportLayout,
} from '@/styles/ReaderStyles';
import { StyleSheet } from 'react-native';

describe('Bible reader text scaling', () => {
  it('applies the full 200% app preference to scripture and document text', () => {
    const reader = createReaderStyles(2);
    const document = createDocumentStyles(2);

    expect(StyleSheet.flatten(reader.verseText)).toMatchObject({
      fontSize: 38,
      lineHeight: 60,
    });
    expect(StyleSheet.flatten(reader.detailText)).toMatchObject({
      fontSize: 32,
      lineHeight: 48,
    });
    expect(StyleSheet.flatten(document.description)).toMatchObject({
      fontSize: 32,
      lineHeight: 44,
    });
  });

  it('keeps growing for uncapped operating-system font scales', () => {
    const atTwoHundredPercent = getBibleDockLayout(800, 2);
    const atFourHundredPercent = getBibleDockLayout(800, 4);

    expect(atTwoHundredPercent.stackControls).toBe(true);
    expect(atFourHundredPercent.stackControls).toBe(true);
    expect(atFourHundredPercent.controlHeight).toBeGreaterThan(
      atTwoHundredPercent.controlHeight,
    );
    expect(atFourHundredPercent.dockHeight).toBeGreaterThan(
      atTwoHundredPercent.dockHeight,
    );
    expect(atFourHundredPercent.audioDockHeight).toBeGreaterThan(
      atTwoHundredPercent.audioDockHeight,
    );
  });

  it('stacks reader controls when space is narrow or text is enlarged', () => {
    expect(getBibleDockLayout(320, 1).stackControls).toBe(false);
    expect(getBibleDockLayout(390, 1).stackControls).toBe(false);
    expect(getBibleDockLayout(900, 1).stackControls).toBe(false);
    expect(getBibleDockLayout(320, 2).stackControls).toBe(true);
    expect(getBibleDockLayout(320, 3).stackControls).toBe(true);
    expect(getBibleDockLayout(900, 1.5).stackControls).toBe(true);
  });

  it('reserves navigation content space for both font scales and safe areas', () => {
    const compact = createNavigationStyles(1, { bottomInset: 0, fontScale: 1 });
    const enlarged = createNavigationStyles(2, {
      bottomInset: 24,
      fontScale: 2,
    });

    expect(StyleSheet.flatten(enlarged.contentContainer).paddingBottom).toBeGreaterThan(
      StyleSheet.flatten(compact.contentContainer).paddingBottom as number,
    );
    expect(StyleSheet.flatten(enlarged.subheader).fontSize).toBe(32);
  });

  it('reserves a second header row for enlarged Bible controls', () => {
    const ordinaryHeader = getGlobalHeaderHeightForScale(2);
    const bibleHeader = getGlobalHeaderHeightForScale(2, true);

    expect(bibleHeader).toBeGreaterThan(ordinaryHeader);
    expect(getGlobalHeaderHeightForScale(4, true)).toBeGreaterThan(bibleHeader);
  });

  it.each([
    { effectiveScale: 3, viewportHeight: 568 },
    { effectiveScale: 4, viewportHeight: 800 },
  ])(
    'keeps the full audio and selection dock reachable at 320x$viewportHeight and $effectiveScale× effective text',
    ({ effectiveScale, viewportHeight }) => {
      const dock = getBibleDockLayout(320, effectiveScale);
      const contentHeight =
        dock.dockHeight + dock.audioDockHeight + dock.selectionBarHeight;
      const headerHeight = getGlobalHeaderHeightForScale(effectiveScale, true);
      const viewport = getBibleDockViewportLayout({
        bottomInset: 0,
        bottomTabHeight: getBottomTabContentHeight(effectiveScale),
        contentHeight,
        headerHeight,
        viewportHeight,
      });

      expect(contentHeight).toBeGreaterThan(viewportHeight);
      expect(viewport.maxVisibleHeight).toBeLessThan(viewportHeight);
      expect(viewport.hiddenHeight).toBe(viewport.maxVisibleHeight);
      expect(viewport.visibleHeight).toBe(viewport.maxVisibleHeight);
      expect(viewport.hiddenNeedsScroll).toBe(true);
      expect(viewport.visibleNeedsScroll).toBe(true);
      expect(viewport.visibleHeight + headerHeight).toBeLessThanOrEqual(
        viewportHeight,
      );
    },
  );

  it('preserves the natural dock height at 100% when scrolling is unnecessary', () => {
    const dock = getBibleDockLayout(390, 1);
    const bottomTabHeight = getBottomTabContentHeight(1);
    const viewport = getBibleDockViewportLayout({
      bottomInset: 0,
      bottomTabHeight,
      contentHeight: dock.dockHeight,
      headerHeight: getGlobalHeaderHeightForScale(1, true),
      viewportHeight: 800,
    });

    expect(viewport.hiddenHeight).toBe(dock.dockHeight);
    expect(viewport.visibleHeight).toBe(dock.dockHeight + bottomTabHeight);
    expect(viewport.hiddenNeedsScroll).toBe(false);
    expect(viewport.visibleNeedsScroll).toBe(false);
  });
});
