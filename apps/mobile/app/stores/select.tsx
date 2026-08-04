import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button, Card, Field, Pill, Screen, SectionTitle } from '@/components/ui';
import { demoStores } from '@/lib/mock-data';
import { colors, radius } from '@/lib/theme';

export default function StoreSelectScreen() {
  const [query, setQuery] = useState('');
  const stores = demoStores.filter((store) => `${store.name} ${store.city} ${store.postalCode}`.toLowerCase().includes(query.toLowerCase()));
  return <Screen><Card tone="mint"><View style={styles.location}><Ionicons name="navigate" size={25} color={colors.mintDark} /><View style={{ flex: 1 }}><Text style={styles.locationTitle}>Trouver autour de moi</Text><Text style={styles.meta}>Votre position sert uniquement à trouver les magasins proches. La sélection manuelle reste possible.</Text></View></View><Button label="Utiliser ma position" variant="secondary" icon="location" onPress={() => Alert.alert('Position approximative', '3 magasins trouvés. Votre position exacte ne sera pas conservée.')} /></Card>
    <Field label="Recherche manuelle" placeholder="Nom, ville, code postal ou adresse" value={query} onChangeText={setQuery} />
    <SectionTitle title="Magasins proches" action="Carte" />
    {stores.map((store, index) => <Pressable key={store.id} onPress={() => router.back()} style={styles.store}><View style={[styles.storeIcon, index === 0 && styles.recent]}><Ionicons name="storefront" size={22} color={index === 0 ? colors.primaryDark : colors.mintDark} /></View><View style={{ flex: 1 }}><Text style={styles.storeName}>{store.name}</Text><Text style={styles.meta}>{store.address}, {store.city}</Text></View><View style={styles.right}><Text style={styles.distance}>{store.distanceKm} km</Text>{index === 0 ? <Pill label="Récent" tone="coral" /> : null}</View></Pressable>)}
    <Card tone="sun"><View style={styles.missing}><View style={{ flex: 1 }}><Text style={styles.locationTitle}>Magasin absent ?</Text><Text style={styles.meta}>Proposez-le. Les doublons proches seront détectés avant validation.</Text></View><Button label="Proposer" variant="secondary" onPress={() => Alert.alert('Proposition', 'La création d’un magasin nécessite un compte et une position sur la carte.')} /></View></Card>
  </Screen>;
}

const styles = StyleSheet.create({ location: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 14 }, locationTitle: { color: colors.ink, fontWeight: '900', fontSize: 15 }, meta: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 }, store: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, padding: 14, borderRadius: radius.lg }, storeIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#E7F8EF', alignItems: 'center', justifyContent: 'center' }, recent: { backgroundColor: '#FFE8E3' }, storeName: { color: colors.ink, fontWeight: '900', fontSize: 14 }, right: { alignItems: 'flex-end', gap: 5 }, distance: { color: colors.ink, fontWeight: '800', fontSize: 11 }, missing: { gap: 14 },
});
