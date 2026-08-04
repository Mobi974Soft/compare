import '@/i18n';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } }));
  return <SafeAreaProvider><QueryClientProvider client={queryClient}><StatusBar style="dark" /><Stack screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.ink, headerTitleStyle: { fontWeight: '800' } }}><Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="product/[barcode]" options={{ title: 'Produit' }} /><Stack.Screen name="price/[id]" options={{ title: 'Détail du prix' }} /><Stack.Screen name="price/new" options={{ presentation: 'modal', title: 'Signaler un prix' }} /><Stack.Screen name="stores/select" options={{ presentation: 'modal', title: 'Choisir un magasin' }} /><Stack.Screen name="auth/index" options={{ presentation: 'modal', title: 'Rejoindre PrixPéi' }} /><Stack.Screen name="settings/index" options={{ title: 'Paramètres' }} /><Stack.Screen name="settings/licenses" options={{ title: 'Sources et licences' }} /></Stack></QueryClientProvider></SafeAreaProvider>;
}
