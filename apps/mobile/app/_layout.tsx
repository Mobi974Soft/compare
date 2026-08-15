import '@/i18n';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';
import { ONBOARDING_KEY } from '@/lib/onboarding';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } }));
  const [isReady, setIsReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const hasHandledInitialRoute = useRef(false);
  const segments = useSegments();

  useEffect(() => {
    void SecureStore.getItemAsync(ONBOARDING_KEY).then((value) => {
      setHasCompletedOnboarding(value === 'true');
      setIsReady(true);
    }).catch(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady || hasHandledInitialRoute.current) return;
    hasHandledInitialRoute.current = true;
    const isOnboarding = segments[0] === 'onboarding';
    if (!hasCompletedOnboarding && !isOnboarding) router.replace('/onboarding');
    if (hasCompletedOnboarding && isOnboarding) router.replace('/(tabs)');
  }, [hasCompletedOnboarding, isReady, segments]);

  if (!isReady) return <View style={styles.loader}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return <SafeAreaProvider><QueryClientProvider client={queryClient}><StatusBar style="dark" /><Stack screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.ink, headerTitleStyle: { fontWeight: '800' } }}><Stack.Screen name="onboarding" options={{ headerShown: false }} /><Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="product/[barcode]" options={{ title: 'Produit' }} /><Stack.Screen name="price/[id]" options={{ title: 'Détail du prix' }} /><Stack.Screen name="price/new" options={{ presentation: 'modal', title: 'Signaler un prix' }} /><Stack.Screen name="stores/select" options={{ presentation: 'modal', title: 'Choisir un magasin' }} /><Stack.Screen name="auth/index" options={{ presentation: 'modal', title: 'Rejoindre PrixPéi' }} /><Stack.Screen name="settings/index" options={{ title: 'Paramètres' }} /><Stack.Screen name="settings/licenses" options={{ title: 'Sources et licences' }} /></Stack></QueryClientProvider></SafeAreaProvider>;
}

const styles = StyleSheet.create({ loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background } });
