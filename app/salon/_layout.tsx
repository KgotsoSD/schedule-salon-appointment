import { Stack } from 'expo-router';

export default function SalonLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="[id]/book" />
    </Stack>
  );
}
