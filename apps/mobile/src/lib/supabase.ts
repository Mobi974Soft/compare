import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const secureStorage: SupportedStorage = {
  getItem: (keyName) => SecureStore.getItemAsync(keyName),
  setItem: (keyName, value) => SecureStore.setItemAsync(keyName, value),
  removeItem: (keyName) => SecureStore.deleteItemAsync(keyName),
};

export const isSupabaseConfigured = Boolean(url && key && !url.includes('your-project'));

export const supabase = createClient(url ?? 'https://placeholder.supabase.co', key ?? 'placeholder', {
  auth: { storage: secureStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});
