import { GlobalHeader } from '@/app/(tabs)/_layout';
import { Stack } from 'expo-router';

export default function ResourcesStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <GlobalHeader {...props} /> }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="bible" />
    </Stack>
  );
}
