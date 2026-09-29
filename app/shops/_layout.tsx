import { Stack } from 'expo-router';

export default function ShopsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_bottom', gestureDirection: 'vertical' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[slug]" />
    </Stack>
  );
}
