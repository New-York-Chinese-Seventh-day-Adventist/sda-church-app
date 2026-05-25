import { GlobalHeader } from '@/components/GlobalHeader';
import { Stack } from 'expo-router';

export default function HomeStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <GlobalHeader {...props} /> }}>
      <Stack.Screen name="about-sda" />
      <Stack.Screen name="about-my-church" />
      <Stack.Screen name="team" />
      <Stack.Screen name="bulletin" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="give" />
    </Stack>
  );
}
