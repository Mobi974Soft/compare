import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/lib/theme';

const icon = (name: keyof typeof Ionicons.glyphMap, focused: boolean) => <View style={[styles.iconWrap, focused && styles.iconActive]}><Ionicons name={name} size={22} color={focused ? colors.navy : colors.muted} /></View>;

export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarStyle: styles.bar, tabBarLabelStyle: styles.label }}>
    <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ focused }) => icon('home', focused) }} />
    <Tabs.Screen name="map" options={{ title: 'Carte', tabBarIcon: ({ focused }) => icon('map', focused) }} />
    <Tabs.Screen name="scan" options={{ title: 'Scanner', tabBarIcon: ({ focused }) => icon('scan', focused), tabBarItemStyle: styles.scanItem }} />
    <Tabs.Screen name="leaderboard" options={{ title: 'Classement', tabBarIcon: ({ focused }) => icon('trophy', focused) }} />
    <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ focused }) => icon('person', focused) }} />
  </Tabs>;
}

const styles = StyleSheet.create({ bar: { position: 'absolute', height: 82, paddingTop: 9, paddingBottom: 16, backgroundColor: colors.white, borderTopColor: colors.line }, label: { fontWeight: '800', fontSize: 10 }, iconWrap: { width: 38, height: 32, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, iconActive: { backgroundColor: colors.sunshine }, scanItem: { transform: [{ translateY: -7 }] } });
