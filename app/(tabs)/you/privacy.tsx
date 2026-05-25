import { DESIGN_TOKENS } from '@/constants/Layout';
import { useAppTheme } from '@/constants/Themes';
import { NavigationStyles } from '@/styles/NavigationStyles';
import { Stack } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * ATTENTION: This file must ONLY ever use English.
 *
 * To maintain legal consistency and avoid ambiguity across different
 * jurisdictions or languages, the Privacy Policy is intentionally kept in
 * English-only. This aligns with Project Tenet 2 (Liability-Free).
 */
export default function PrivacyPolicyScreen() {
  const theme = useAppTheme();
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
      <Stack.Screen options={{ title: 'Privacy Policy' }} />

      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.onBackground }]}
      >
        Privacy Policy
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
        1. Introduction
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.bodyText, { color: theme.colors.onSurface }]}
      >
        This application values your privacy. We do not host, store, or manage any
        personal identifiable information on our own servers. This page outlines how
        third-party services handle data to keep the application functional.
      </Text>

      <Text
        variant="titleMedium"
        style={[styles.sectionHeader, { color: theme.colors.onBackground }]}
      >
        2. Hosting (GitHub Pages)
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.bodyText, { color: theme.colors.onSurface }]}
      >
        This web application is deployed using GitHub Pages. GitHub may collect basic
        server logs and IP addresses for security, debugging, and operational maintenance.
      </Text>

      <Text
        variant="titleMedium"
        style={[styles.sectionHeader, { color: theme.colors.onBackground }]}
      >
        3. Traffic Management (Cloudflare)
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.bodyText, { color: theme.colors.onSurface }]}
      >
        We use Cloudflare to manage domain traffic and protect the application from common
        web threats. Cloudflare may process basic connection data (such as IP addresses)
        to identify malicious traffic and optimize performance. No user-level activity
        within the app is tracked by this service.
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
