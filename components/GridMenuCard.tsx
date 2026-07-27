import { useAppTheme } from '@/constants/Themes';
import { scaleTypographyMetric } from '@/constants/AppPreferences';
import { useTextSize } from '@/constants/TextSizeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

interface GridMenuCardProps {
  title: string;
  subtitle?: string;
  /** MaterialCommunityIcons glyph for the decorative illustration area */
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Pastel background color for the card */
  color: string;
  /** Icon tint — defaults to a semi-transparent dark of the card color */
  iconColor?: string;
  onPress?: () => void;
  style?: ViewStyle | any;
}

export const GridMenuCard: React.FC<GridMenuCardProps> = ({
  title,
  subtitle,
  icon,
  color,
  iconColor,
  onPress,
  style,
}) => {
  const theme = useAppTheme();
  const { textScale } = useTextSize();
  const { fontScale } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(textScale, Math.max(1, fontScale * textScale)),
    [fontScale, textScale],
  );
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  // Derive a slightly darker icon color from the card color for the illustration
  const resolvedIconColor = iconColor ?? 'rgba(40, 40, 40, 0.18)';
  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
        accessibilityRole={onPress ? 'button' : undefined}
        disabled={!onPress}
        style={[
          styles.card,
          { backgroundColor: color, borderWidth: 1, borderColor: theme.colors.outlineVariant },
          onPress && Platform.OS === 'web' ? styles.webPressable : null,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Title block — top left */}
        <View pointerEvents="none" style={styles.titleBlock}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>{subtitle}</Text> : null}
        </View>

        {/* Illustration + arrow row — bottom */}
        <View pointerEvents="none" style={styles.bottomRow}>
          <View style={styles.decorIconContainer}>
            <MaterialCommunityIcons
              name={icon}
              size={68}
              color={resolvedIconColor}
              style={styles.decorIcon}
            />
          </View>
          {/* Diagonal arrow affordance */}
          <View style={styles.arrowBadge}>
            <MaterialCommunityIcons
              name="arrow-top-right"
              size={14}
              color="#374151"
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (textScale: Parameters<typeof scaleTypographyMetric>[1], effectiveScale: number) => StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151', // crisp dark border
    padding: 18,
    minHeight: 148 + Math.round(Math.max(0, effectiveScale - 1) * 64),
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  webPressable: {
    cursor: 'pointer',
  },
  titleBlock: {
    flex: 0,
  },
  title: {
    fontSize: scaleTypographyMetric(15, textScale),
    fontWeight: '700',
    // color will be set via theme (onSurface) in component
    lineHeight: scaleTypographyMetric(20, textScale),
    maxWidth: '90%',
  },
  subtitle: {
    fontSize: scaleTypographyMetric(12, textScale),
    lineHeight: scaleTypographyMetric(18, textScale),
    // color will be set via theme (onSurfaceVariant) in component
    marginTop: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  decorIcon: {
    // Offset slightly so it bleeds toward the edge for a richer look
    marginLeft: -6,
    marginBottom: -6,
  },
  decorIconContainer: {
    position: 'relative',
  },
  decorIconBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  arrowBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF', // solid white
    borderWidth: 1,
    borderColor: '#374151', // crisp dark border
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
});
