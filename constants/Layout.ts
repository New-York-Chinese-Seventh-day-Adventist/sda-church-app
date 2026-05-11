/**
 * Centralized layout constants to ensure consistency across the "Digital Sanctuary".
 * Based on UI_UX.md standards.
 */

export const DESIGN_TOKENS = {
  // Material 3 Appbar height is 64dp (Small/Center-aligned variant).
  // Ref: https://m3.material.io/components/top-app-bar/specs
  // Note: While iOS HIG traditionally uses 44pt for navigation bars, react-native-paper
  // implements MD3 standards (64dp) across both platforms for layout consistency.
  HEADER_HEIGHT_BASE: 64,
  // Used for the "Glass Rule" 0.5px borders
  BORDER_WEIGHT: 0.5,
  // Standard gutter for containers and card spacing
  VIEW_PADDING: 16,
};
