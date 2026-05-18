import { GlobalHeader } from '@/components/GlobalHeader';
import { Stack } from 'expo-router';

export default function HomeStackLayout() {
  return (
    <Stack screenOptions={{ header: (props) => <GlobalHeader {...props} /> }}>
      <Stack.Screen name="about_sda" />
      <Stack.Screen name="about_my_church" />
      <Stack.Screen name="team" />
      <Stack.Screen name="bulletin" />
      <Stack.Screen name="contact" />
    </Stack>
  );
}
