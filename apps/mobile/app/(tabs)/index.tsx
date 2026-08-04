import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen, Header, Card, SectionTitle, Pill } from '@/components/ui';
import { ProductMiniCard } from '@/components/PriceCard';
import { demoProduct, demoStores } from '@/lib/mock-data';
import { colors, radius } from '@/lib/theme';
import { useSessionStore } from '@/store/session';

export default function HomeScreen() {
  const { isGuest, alias } = useSessionStore();
  return <Screen>
    <Header eyebrow="Bonjour 👋" title={isGuest ? 'Les bons prix sont juste ici.' : `À vous de jouer, ${alias}.`} subtitle="Comparez les prix signalés près de vous et aidez la communauté." action={<Pressable onPress={() => router.push('/settings')} style={styles.avatar}><Ionicons name="notifications-outline" size={21} color={colors.ink} /></Pressable>} />
    <LinearGradient colors={['#FF6A53', '#FF4D38']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.scanHero}>
      <View style={styles.scanCopy}><Pill label="En un geste" tone="yellow" icon="flash" /><Text style={styles.scanTitle}>Scannez. Comparez. Économisez.</Text><Text style={styles.scanText}>Visez le code-barres et retrouvez les prix communautaires autour de vous.</Text></View>
      <Pressable onPress={() => router.push('/scan')} style={styles.scanButton}><View style={styles.scanIcon}><Ionicons name="barcode" size={30} color={colors.primary} /></View><Text style={styles.scanButtonText}>Scanner un produit</Text><Ionicons name="arrow-forward" size={20} color={colors.ink} /></Pressable>
      <View style={styles.orbitOne} /><View style={styles.orbitTwo} />
    </LinearGradient>
    <Pressable onPress={() => router.push('/scan')} style={styles.search}><Ionicons name="search" size={20} color={colors.muted} /><Text style={styles.searchText}>Rechercher un produit ou saisir un code</Text></Pressable>
    <SectionTitle title="À proximité" action="Voir la carte" onAction={() => router.push('/map')} />
    <View style={styles.storeRow}>{demoStores.slice(0, 2).map((store, index) => <Card key={store.id} tone={index === 0 ? 'mint' : 'sun'} style={styles.storeCard}><View style={styles.storeTop}><Ionicons name="storefront" size={21} color={colors.ink} /><Text style={styles.distance}>{store.distanceKm} km</Text></View><Text numberOfLines={2} style={styles.storeName}>{store.name}</Text><Text style={styles.storeCity}>{store.city}</Text></Card>)}</View>
    <SectionTitle title="Consulté récemment" />
    <ProductMiniCard product={demoProduct} onPress={() => router.push(`/product/${demoProduct.barcode}`)} />
    <SectionTitle title="La baisse du moment" />
    <Card tone="sun"><View style={styles.drop}><View style={styles.dropBadge}><Ionicons name="trending-down" size={25} color={colors.mintDark} /></View><View style={{ flex: 1 }}><Text style={styles.dropTitle}>–12 % cette semaine</Text><Text style={styles.dropText}>Pâte à tartiner · Marché des Tamarins</Text></View><Text style={styles.dropPrice}>3,84 €</Text></View></Card>
    <Text style={styles.disclaimer}>Prix signalés par la communauté · À confirmer en magasin. Ce service est indépendant des enseignes référencées.</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  avatar: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  scanHero: { minHeight: 290, borderRadius: radius.xl, padding: 22, overflow: 'hidden', justifyContent: 'space-between' }, scanCopy: { maxWidth: 290, gap: 9, zIndex: 2 }, scanTitle: { color: colors.white, fontWeight: '900', fontSize: 28, lineHeight: 31, letterSpacing: -0.8 }, scanText: { color: '#FFF3F0', fontSize: 14, lineHeight: 20 }, scanButton: { height: 62, paddingHorizontal: 10, borderRadius: 19, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 11, zIndex: 2 }, scanIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF0ED', alignItems: 'center', justifyContent: 'center' }, scanButtonText: { flex: 1, fontWeight: '900', color: colors.ink, fontSize: 16 }, orbitOne: { position: 'absolute', width: 180, height: 180, borderWidth: 35, borderColor: 'rgba(255,255,255,.09)', borderRadius: 90, right: -70, top: -40 }, orbitTwo: { position: 'absolute', width: 90, height: 90, borderWidth: 18, borderColor: 'rgba(255,255,255,.08)', borderRadius: 45, left: -35, bottom: 20 },
  search: { height: 54, borderRadius: radius.md, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }, searchText: { color: colors.muted, fontSize: 14 }, storeRow: { flexDirection: 'row', gap: 12 }, storeCard: { flex: 1, minHeight: 138, justifyContent: 'space-between' }, storeTop: { flexDirection: 'row', justifyContent: 'space-between' }, distance: { fontSize: 11, fontWeight: '800', color: colors.muted }, storeName: { color: colors.ink, fontSize: 16, lineHeight: 20, fontWeight: '900' }, storeCity: { color: colors.muted, fontSize: 12 },
  drop: { flexDirection: 'row', alignItems: 'center', gap: 13 }, dropBadge: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }, dropTitle: { fontSize: 16, fontWeight: '900', color: colors.ink }, dropText: { color: colors.muted, fontSize: 12, marginTop: 3 }, dropPrice: { fontSize: 20, fontWeight: '900', color: colors.ink }, disclaimer: { textAlign: 'center', color: colors.muted, fontSize: 11, lineHeight: 17, marginHorizontal: 18 },
});
