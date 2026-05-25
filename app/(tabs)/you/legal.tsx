import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { NavigationStyles } from '@/styles/NavigationStyles';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * ATTENTION: This file must ONLY ever use English.
 *
 * To maintain legal consistency and avoid ambiguity across different
 * jurisdictions or languages, Legal Information is intentionally kept in
 * English-only. This aligns with Project Tenet 2 (Liability-Free).
 */
export default function LegalScreen() {
  const theme = useAppTheme();
  const { backTo } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + DESIGN_TOKENS.HEADER_HEIGHT_BASE;

  return (
    <ScrollView
      style={[NavigationStyles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        NavigationStyles.contentContainer,
        { paddingTop: headerHeight + 20, paddingBottom: 40 },
      ]}
    >
      <Stack.Screen options={{ title: 'Legal Information', backTo } as any} />

      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.onBackground }]}
      >
        Legal Information
      </Text>
      <Text
        variant="labelSmall"
        style={[styles.lastUpdated, { color: theme.colors.onSurfaceVariant }]}
      >
        Last Updated: May 2026
      </Text>

      <Text
        variant="titleMedium"
        style={[styles.sectionHeader, { color: theme.colors.onBackground }]}
      >
        1. Usage of External Resources
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.bodyText, { color: theme.colors.onSurface }]}
      >
        This app links to Hymnary.org for hymn resources. Please be aware that some hymns
        are copyrighted. When you follow these links, you are subject to Hymnary.org’s
        terms and conditions. You may be prompted to accept their terms before viewing
        certain content. Please respect copyright laws and do not attempt to bypass these
        requirements.
      </Text>

      <Text
        variant="titleMedium"
        style={[styles.sectionHeader, { color: theme.colors.onBackground }]}
      >
        2. Data Attribution
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.bodyText, { color: theme.colors.onSurface }]}
      >
        This application provides access to non-copyrightable metadata (hymn titles and
        index numbers) to facilitate navigation. We do not host or reproduce protected
        musical notation or lyrics. All external content is accessed through direct links
        to authorized third-party providers.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: 'bold', marginBottom: 5 },
  lastUpdated: { marginBottom: 20 },
  sectionHeader: { fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
  bodyText: { lineHeight: 22 },
});
