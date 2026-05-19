import { GlobalHeader } from '@/components/GlobalHeader';
import { Stack } from 'expo-router';

export default function CommunityStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <GlobalHeader {...props} /> }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="worship" />
      <Stack.Screen name="fellowship" />
      <Stack.Screen name="roster" />
      <Stack.Screen name="prayer" />
      <Stack.Screen name="baptism" />
      {/* Add other community sub-pages here if needed */}
    </Stack>
  );
}
