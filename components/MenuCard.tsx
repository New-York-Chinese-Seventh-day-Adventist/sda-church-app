import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "react-native-paper";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

interface MenuCardProps {
  title: string;
  description?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap | null;
  style?: ViewStyle | any;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  title,
  description,
  icon,
  iconColor,
  onPress,
  rightIcon = "chevron-right",
  style,
}) => {
  const theme = useTheme();
  return (
    <AnimatedTouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <MaterialCommunityIcons
        name={icon}
        size={32}
        color={iconColor || theme.colors.onSurfaceVariant}
      />
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
        {description && (
          <Text
            style={[
              styles.cardSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      {rightIcon && (
        <MaterialCommunityIcons
          name={rightIcon}
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      )}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardContent: { flex: 1, marginLeft: 16 },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  cardSubtitle: { fontSize: 14, marginTop: 2 },
});
