import { DESIGN_TOKENS } from "@/constants/Layout";
import { scaleTypographyMetric } from "@/constants/AppPreferences";
import { useTextSize } from "@/constants/TextSizeContext";
import { useAppTheme } from "@/constants/Themes";
import {
  AppIcon,
  type AppIconProps,
  type MaterialCommunityIconName,
} from "@/components/AppIcon";
import React, { useMemo } from "react";
import {
  AccessibilityRole,
  AccessibilityState,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

interface MenuCardProps {
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  title: string;
  description?: string;
  icon: MaterialCommunityIconName | AppIconProps;
  iconColor?: string;
  onPress?: () => void;
  rightIcon?: MaterialCommunityIconName | AppIconProps | null;
  rightElement?: () => React.ReactNode;
  reflowAtLargeText?: boolean;
  style?: ViewStyle | any;
}

interface MenuCardSwitchVisualProps {
  active: boolean;
  activeColor: string;
  inactiveColor: string;
  thumbColor: string;
}

const switchVisualStyles = StyleSheet.create({
  track: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    height: 32,
    paddingHorizontal: 3,
    width: 52,
  },
  thumb: {
    borderRadius: 13,
    height: 26,
    width: 26,
  },
});

export const MenuCardSwitchVisual = ({
  active,
  activeColor,
  inactiveColor,
  thumbColor,
}: MenuCardSwitchVisualProps) => (
  <View
    accessible={false}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    pointerEvents="none"
    testID="menu-card-switch-visual"
    style={[
      switchVisualStyles.track,
      {
        backgroundColor: active ? activeColor : inactiveColor,
        justifyContent: active ? "flex-end" : "flex-start",
      },
    ]}
  >
    <View style={[switchVisualStyles.thumb, { backgroundColor: thumbColor }]} />
  </View>
);

export const MenuCard: React.FC<MenuCardProps> = ({
  accessibilityRole,
  accessibilityState,
  title,
  description,
  icon,
  iconColor,
  onPress,
  rightIcon = "chevron-right",
  rightElement,
  reflowAtLargeText = false,
  style,
}) => {
  const theme = useAppTheme();
  const { textScale } = useTextSize();
  const { fontScale } = useWindowDimensions();
  const stacked =
    reflowAtLargeText && Math.max(1, fontScale * textScale) >= 1.5;
  const styles = useMemo(() => createStyles(textScale), [textScale]);
  return (
    <AnimatedTouchableOpacity
      accessibilityLabel={description ? `${title}. ${description}` : title}
      accessibilityRole={accessibilityRole ?? (onPress ? "button" : undefined)}
      accessibilityState={accessibilityState}
      style={[
        styles.card,
        stacked && styles.stackedCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
        onPress && Platform.OS === "web" ? styles.webPressable : null,
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <AppIcon
        pointerEvents="none"
        {...(typeof icon === "string" ? { name: icon } : icon)}
        size={DESIGN_TOKENS.ICON_SIZE_FEATURED}
        color={iconColor || theme.colors.tertiary}
      />
      <View
        pointerEvents="none"
        style={[styles.cardContent, stacked && styles.stackedCardContent]}
      >
        <Text
          style={[
            styles.cardTitle,
            stacked && styles.stackedText,
            { color: theme.colors.onSurface },
          ]}
        >
          {title}
        </Text>
        {description && (
          <Text
            style={[
              styles.cardSubtitle,
              stacked && styles.stackedText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      {!stacked && (rightElement
        ? <View pointerEvents="none">{rightElement()}</View>
        : rightIcon && (
            <AppIcon
              pointerEvents="none"
              {...(typeof rightIcon === "string"
                ? { name: rightIcon }
                : rightIcon)}
              size={DESIGN_TOKENS.ICON_SIZE_STANDARD}
              color={theme.colors.onSurfaceVariant}
            />
          ))}
    </AnimatedTouchableOpacity>
  );
};

const createStyles = (textScale: Parameters<typeof scaleTypographyMetric>[1]) => StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  webPressable: {
    cursor: "pointer",
  },
  cardContent: { flex: 1, flexShrink: 1, marginLeft: 16, minWidth: 0 },
  stackedCardContent: {
    alignItems: 'center',
    flexGrow: 0,
    marginLeft: 0,
    marginTop: 12,
    width: '100%',
  },
  stackedCard: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  stackedText: {
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: scaleTypographyMetric(18, textScale),
    lineHeight: scaleTypographyMetric(24, textScale),
    fontWeight: "700",
    flexShrink: 1,
  },
  cardSubtitle: {
    fontSize: scaleTypographyMetric(14, textScale),
    lineHeight: scaleTypographyMetric(20, textScale),
    marginTop: 2,
    flexShrink: 1,
  },
});
