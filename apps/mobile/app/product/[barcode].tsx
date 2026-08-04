import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { colors, radius } from '@/lib/theme';
import { Button, Card, Pill, Screen, SectionTitle } from '@/components/ui';
import { PriceCard } from '@/components/PriceCard';
import { useSessionStore } from '@/store/session';

export default function ProductScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const session = useSessionStore();
  const productQuery = useQuery({ queryKey: ['product', barcode], queryFn: () => api.getProductByBarcode(barcode ?? '') });
  const priceQuery = useQuery({ queryKey: ['prices', productQuery.data?.id], queryFn: () => api.getProductPrices(productQuery.data!.id), enabled: Boolean(productQuery.data) });
  if (productQuery.isLoading) return <Screen><View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.loading}>Identification du produit…</Text></View></Screen>;
  if (!productQuery.data) return <Screen><Card tone="sun"><Text style={styles.errorTitle}>Produit introuvable</Text><Text style={styles.body}>Vous pourrez proposer une fiche provisoire après connexion.</Text></Card><Button label="Scanner un autre produit" onPress={() => router.replace('/scan')} /></Screen>;
  const product = productQuery.data;
  const contribute = () => {
    const path = `/price/new?productId=${product.id}&barcode=${product.barcode}`;
    if (session.isGuest) { session.setPendingAction({ path, label: 'signaler ce prix' }); router.push('/auth'); } else router.push(path);
  };
  return <Screen>
    <View style={styles.productHero}><View style={styles.imageWrap}>{product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.image} /> : <Ionicons name="basket" size={72} color={colors.primary} />}</View><View style={styles.productInfo}><Pill label={product.category} tone="green" /><Text style={styles.brand}>{product.brand}</Text><Text style={styles.name}>{product.name}</Text><Text style={styles.quantity}>{product.displayQuantity} · EAN {product.barcode}</Text></View></View>
    <View style={styles.attribution}><Ionicons name="information-circle-outline" size={16} color={colors.muted} /><Text style={styles.attributionText}>Informations produit et image fournies en partie par {product.imageAttribution}.</Text></View>
    <Card tone="mint"><View style={styles.best}><View style={{ flex: 1 }}><Text style={styles.community}>Prix communautaire le plus bas</Text><Text style={styles.bestPrice}>3,84 €</Text><Text style={styles.bestMeta}>parmi les signalements récents dans un rayon de 10 km</Text></View><View style={styles.saving}><Text style={styles.savingText}>–0,35 €</Text><Text style={styles.savingSub}>vs médiane</Text></View></View></Card>
    <Button label="Signaler un prix" icon="add-circle" onPress={contribute} />
    <View style={styles.switcher}><Pressable style={[styles.switch, styles.switchActive]}><Text style={styles.switchActiveText}>Prix</Text></Pressable><Pressable style={styles.switch}><Text style={styles.switchText}>Carte</Text></Pressable><Pressable style={styles.switch}><Text style={styles.switchText}>Historique</Text></Pressable></View>
    <SectionTitle title={`${priceQuery.data?.length ?? 0} prix autour de vous`} action="Trier : prix" />
    {priceQuery.isLoading ? <ActivityIndicator color={colors.primary} /> : priceQuery.data?.map((report) => <PriceCard key={report.id} report={report} product={product} />)}
    <Card tone="sun"><View style={styles.notice}><Ionicons name="shield-checkmark" size={24} color={colors.primaryDark} /><Text style={styles.noticeText}>À confirmer en magasin. Les prix sont signalés par la communauté et peuvent évoluer.</Text></View></Card>
  </Screen>;
}

const styles = StyleSheet.create({ center: { minHeight: 500, alignItems: 'center', justifyContent: 'center', gap: 14 }, loading: { color: colors.muted, fontWeight: '700' }, productHero: { flexDirection: 'row', gap: 18, alignItems: 'center' }, imageWrap: { width: 128, height: 150, borderRadius: radius.xl, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }, image: { width: 110, height: 130, resizeMode: 'contain' }, productInfo: { flex: 1, gap: 5 }, brand: { color: colors.primaryDark, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', marginTop: 6 }, name: { color: colors.ink, fontSize: 23, lineHeight: 27, fontWeight: '900', letterSpacing: -0.6 }, quantity: { color: colors.muted, fontSize: 11, lineHeight: 16 }, attribution: { flexDirection: 'row', gap: 7, paddingHorizontal: 4 }, attributionText: { flex: 1, color: colors.muted, fontSize: 10, lineHeight: 15 }, best: { flexDirection: 'row', gap: 10, alignItems: 'center' }, community: { color: colors.mintDark, fontSize: 12, fontWeight: '900' }, bestPrice: { color: colors.ink, fontSize: 34, fontWeight: '900', marginTop: 2 }, bestMeta: { color: colors.muted, fontSize: 10, maxWidth: 210 }, saving: { padding: 10, backgroundColor: colors.white, borderRadius: 15, alignItems: 'center' }, savingText: { color: colors.mintDark, fontWeight: '900' }, savingSub: { color: colors.muted, fontSize: 9, marginTop: 2 }, switcher: { flexDirection: 'row', backgroundColor: '#E9ECE8', borderRadius: radius.md, padding: 4 }, switch: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 }, switchActive: { backgroundColor: colors.white }, switchText: { color: colors.muted, fontWeight: '800' }, switchActiveText: { color: colors.ink, fontWeight: '900' }, notice: { flexDirection: 'row', alignItems: 'center', gap: 12 }, noticeText: { flex: 1, color: colors.ink, fontSize: 12, lineHeight: 18 }, errorTitle: { fontSize: 21, fontWeight: '900', color: colors.ink }, body: { color: colors.muted, lineHeight: 21, marginTop: 7 },
});
