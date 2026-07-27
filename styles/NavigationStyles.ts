import {
  DEFAULT_TEXT_SCALE,
  scaleTypographyMetric,
  type TextScale,
} from '@/constants/AppPreferences';
import { useTextSize } from '@/constants/TextSizeContext';
import { useMemo } from 'react';
import { StyleSheet } from "react-native";

/**
 * Shared styles for Menu/Navigation-heavy screens.
 * Preference given to the layout logic defined in ResourcesScreen.
 */
export const createNavigationStyles = (textScale: TextScale) => StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20, // Preference: resources.tsx
    paddingBottom: 80, // Tab bar gutter
  },
  heroHeader: {
    width: '100%',
    minHeight: 220,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroTitle: {
    fontWeight: 'bold',
    fontSize: scaleTypographyMetric(26, textScale),
    lineHeight: scaleTypographyMetric(34, textScale),
    textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subheader: {
    fontWeight: "bold",
    fontSize: scaleTypographyMetric(16, textScale), // Preference: resources.tsx
    lineHeight: scaleTypographyMetric(22, textScale),
  },
});

export const NavigationStyles = createNavigationStyles(DEFAULT_TEXT_SCALE);

export const useNavigationStyles = () => {
  const { textScale } = useTextSize();
  return useMemo(() => createNavigationStyles(textScale), [textScale]);
};
