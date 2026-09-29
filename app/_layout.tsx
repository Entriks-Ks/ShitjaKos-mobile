import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { refreshSession, useSession } from '@/lib/auth';
import { BusinessProvider } from '@/lib/businesses';
import { InboxProvider } from '@/lib/inbox';
import { MineProvider } from '@/lib/mine';
import { SavedProvider } from '@/lib/saved';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    GeistExtraBold: require('../assets/fonts/Geist-ExtraBold.ttf'),
    GeistSemiBold: require('../assets/fonts/Geist-SemiBold.ttf'),
  });
  const { isPending } = useSession();
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    refreshSession();
  }, []);

  useEffect(() => {
    if (!isPending) {
      setSessionReady(true);
    }
  }, [isPending]);

  useEffect(() => {
    if (loaded && sessionReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, sessionReady]);

  if (!loaded || !sessionReady) {
    return null;
  }

  return (
    <SavedProvider>
    <MineProvider>
    <BusinessProvider>
    <InboxProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="shops" options={{ animation: 'slide_from_bottom', gestureDirection: 'vertical' }} />
      <Stack.Screen name="listing/[id]" />
      <Stack.Screen name="chat/[listingId]" />
      <Stack.Screen name="business/new" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot" />
      <Stack.Screen name="reset" />
    </Stack>
    </InboxProvider>
    </BusinessProvider>
    </MineProvider>
    </SavedProvider>
  );
}
