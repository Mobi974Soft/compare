import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PriceReport, Product } from '@prixpei/domain';
import { formatObservedAt, normalizedUnitPrice, trustLabel } from '@prixpei/domain';
import { router } from 'expo-router';
import { colors, radius } from '@/lib/theme';
import { Pill } from './ui';

export function PriceCard({ report, product, compact = false }: { report: PriceReport; product?: Product; compact?: boolean }) {
  const perUnit = product ? normalizedUnitPrice(report.price, product.normalizedQuantity, product.unit) : null;
  const trustTone = report.trustScore >= 80 ? 'green' : report.trustScore >= 60 ? 'yellow' : 'coral';
  return <Pressable onPress={() => router.push(`/price/${report.id}`)} style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}>
    <View style={styles.top}>
      <View style={styles.storeIcon}><Ionicons name="storefront" size={20} color={colors.mintDark} /></View>
      <View style={styles.storeText}><Text style={styles.store}>{report.store.name}</Text><Text style={styles.meta}>{report.store.distanceKm?.toFixed(1)} km · {formatObservedAt(report.observedAt)}</Text></View>
      <View style={styles.priceBlock}><Text style={styles.price}>{report.price.toFixed(2).replace('.', ',')} €</Text>{perUnit ? <Text style={styles.unit}>{perUnit.toFixed(2).replace('.', ',')} €/kg</Text> : null}</View>
    </View>
    {!compact ? <View style={styles.bottom}><Pill label={`${report.trustScore}% · ${trustLabel(report.trustScore)}`} tone={trustTone} icon="shield-checkmark" />{report.priceType === 'promotion' ? <Pill label="Promo" tone="coral" /> : null}{report.loyaltyOnly ? <Pill label="Carte fidélité" tone="yellow" /> : null}</View> : null}
  </Pressable>;
}

export function ProductMiniCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.product}>
    {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.image} /> : <View style={[styles.image, styles.placeholder]}><Ionicons name="basket" size={26} color={colors.primary} /></View>}
    <View style={{ flex: 1 }}><Text style={styles.brand}>{product.brand}</Text><Text numberOfLines={2} style={styles.productName}>{product.name}</Text><Text style={styles.meta}>{product.displayQuantity}</Text></View>
    <Ionicons name="chevron-forward" size={20} color={colors.muted} />
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, gap: 14, borderWidth: 1, borderColor: colors.line }, top: { flexDirection: 'row', alignItems: 'center', gap: 11 }, storeIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#E7F8EF', alignItems: 'center', justifyContent: 'center' }, storeText: { flex: 1, gap: 3 }, store: { color: colors.ink, fontWeight: '800', fontSize: 15 }, meta: { color: colors.muted, fontSize: 12 }, priceBlock: { alignItems: 'flex-end' }, price: { color: colors.ink, fontWeight: '900', fontSize: 21, letterSpacing: -0.5 }, unit: { color: colors.muted, fontSize: 11, marginTop: 2 }, bottom: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  product: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }, image: { width: 64, height: 64, borderRadius: 17, resizeMode: 'contain', backgroundColor: '#F3F3EF' }, placeholder: { alignItems: 'center', justifyContent: 'center' }, brand: { color: colors.primaryDark, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }, productName: { fontSize: 15, lineHeight: 20, fontWeight: '800', color: colors.ink, marginVertical: 2 },
});
