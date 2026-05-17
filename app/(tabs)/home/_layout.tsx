import { GlobalHeader } from '@/components/GlobalHeader';
import { Stack } from 'expo-router';

/**
 * Home Pillar Layout.
 * Provides a stack context for the Home tab to handle sub-navigation to /about.
 */
export default function HomeLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <GlobalHeader {...props} /> }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
    </Stack>
  );
}
