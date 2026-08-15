import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PriceReportInput } from '@prixpei/validation';
import { priceReportSchema } from '@prixpei/validation';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { demoProduct, demoStores } from '@/lib/mock-data';
import { Button, Card, Field, Pill, Screen, SectionTitle } from '@/components/ui';
import { colors, radius } from '@/lib/theme';

export default function NewPriceScreen() {
  const params = useLocalSearchParams<{ productId?: string; barcode?: string }>();
  const [selectedStore, setSelectedStore] = useState(demoStores[0]!);
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<PriceReportInput>({
    resolver: zodResolver(priceReportSchema),
    defaultValues: { productId: params.productId ?? demoProduct.id, storeId: demoStores[0]!.id, price: 3.84, priceType: 'regular', loyaltyOnly: false, availability: 'available', observedAt: new Date().toISOString(), conditions: '', comment: '' },
  });
  const mutation = useMutation({ mutationFn: api.createPriceReport, onSuccess: () => { Alert.alert('Prix publié 🎉', 'Merci ! 10 points provisoires seront validés après contrôle.', [{ text: 'Voir le produit', onPress: () => router.replace(`/product/${params.barcode ?? demoProduct.barcode}`) }]); } });
  const priceType = watch('priceType');
  const loyaltyOnly = watch('loyaltyOnly');
  const onSubmit = (values: PriceReportInput) => {
    if (values.price < 0.3 || values.price > 100) Alert.alert('Prix inhabituel', 'Ce prix est nettement différent des autres signalements. Vérifiez le montant avant de publier.', [{ text: 'Corriger', style: 'cancel' }, { text: 'Publier quand même', onPress: () => mutation.mutate(values) }]);
    else mutation.mutate(values);
  };
  return <Screen>
    <View style={styles.contributionHero}><View style={styles.contributionIcon}><Ionicons name="sparkles" size={26} color={colors.navy} /></View><View style={{ flex: 1 }}><Text style={styles.contributionEyebrow}>Contribution Péi</Text><Text style={styles.contributionTitle}>Partagez le prix que vous voyez.</Text><Text style={styles.contributionText}>Un geste simple qui aide toute La Réunion à économiser.</Text></View></View>
    <Card tone="mint"><View style={styles.product}><View style={styles.productIcon}><Ionicons name="basket" size={25} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.brand}>{demoProduct.brand}</Text><Text style={styles.productName}>{demoProduct.name}</Text><Text style={styles.meta}>{demoProduct.displayQuantity}</Text></View><Pill label="EAN vérifié" tone="green" icon="checkmark-circle" /></View></Card>
    <SectionTitle title="Dans quel magasin ?" />
    <Pressable onPress={() => router.push('/stores/select')} style={styles.store}><View style={styles.storeIcon}><Ionicons name="storefront" size={23} color={colors.mintDark} /></View><View style={{ flex: 1 }}><Text style={styles.storeName}>{selectedStore.name}</Text><Text style={styles.meta}>{selectedStore.address} · {selectedStore.distanceKm} km</Text></View><Ionicons name="chevron-forward" size={20} color={colors.muted} /></Pressable>
    <Controller control={control} name="price" render={({ field: { value, onChange } }) => <Field label="Prix TTC (€)" value={String(value)} onChangeText={(text) => onChange(Number(text.replace(',', '.')))} keyboardType="decimal-pad" error={errors.price?.message} />} />
    <View style={styles.typeRow}>{(['regular', 'promotion'] as const).map((type) => <Pressable key={type} onPress={() => setValue('priceType', type)} style={[styles.type, priceType === type && styles.typeActive]}><Ionicons name={type === 'promotion' ? 'pricetag' : 'cash-outline'} size={22} color={priceType === type ? colors.white : colors.ink} /><Text style={[styles.typeText, priceType === type && styles.typeTextActive]}>{type === 'promotion' ? 'Promotion' : 'Prix normal'}</Text></Pressable>)}</View>
    <View style={styles.toggle}><View style={{ flex: 1 }}><Text style={styles.toggleTitle}>Prix réservé aux membres fidélité</Text><Text style={styles.meta}>Précisez la condition pour éviter toute confusion.</Text></View><Controller control={control} name="loyaltyOnly" render={({ field: { value, onChange } }) => <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: '#D2D8D4' }} />} /></View>
    {loyaltyOnly ? <Controller control={control} name="conditions" render={({ field: { value, onChange } }) => <Field label="Condition de fidélité" placeholder="Ex. avec la carte du magasin" value={value ?? ''} onChangeText={onChange} error={errors.conditions?.message} />} /> : null}
    <SectionTitle title="Disponibilité constatée" />
    <Controller control={control} name="availability" render={({ field: { value, onChange } }) => <View style={styles.availability}>{([['available', 'Disponible', 'checkmark-circle'], ['low_stock', 'Stock faible', 'alert-circle'], ['unavailable', 'Rupture', 'close-circle']] as const).map(([key, label, icon]) => <Pressable key={key} onPress={() => onChange(key)} style={[styles.availabilityItem, value === key && styles.availabilityActive]}><Ionicons name={icon} size={21} color={value === key ? colors.primary : colors.muted} /><Text style={styles.availabilityText}>{label}</Text></Pressable>)}</View>} />
    <Controller control={control} name="comment" render={({ field: { value, onChange } }) => <Field label="Commentaire utile (facultatif)" placeholder="Rayon, fin de promotion, conditionnement…" value={value ?? ''} onChangeText={onChange} multiline maxLength={280} style={styles.textarea} error={errors.comment?.message} />} />
    <Card tone="sun"><View style={styles.summary}><Ionicons name="eye-outline" size={24} color={colors.navy} /><View style={{ flex: 1 }}><Text style={styles.summaryTitle}>Avant de publier</Text><Text style={styles.summaryText}>Vérifiez le montant et le magasin. Aucune photo ni position GPS exacte n’est enregistrée.</Text></View></View></Card>
    <Button label="Publier ce prix" icon="paper-plane" loading={mutation.isPending} onPress={() => void handleSubmit(onSubmit)()} />
  </Screen>;
}

const styles = StyleSheet.create({ contributionHero: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, borderRadius: radius.xl, padding: 20, backgroundColor: colors.navy }, contributionIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.sunshine, alignItems: 'center', justifyContent: 'center' }, contributionEyebrow: { color: colors.sunshine, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 }, contributionTitle: { color: colors.white, fontSize: 23, lineHeight: 27, fontWeight: '900', marginTop: 4 }, contributionText: { color: '#DCE5FF', fontSize: 12, lineHeight: 17, marginTop: 6 }, product: { flexDirection: 'row', alignItems: 'center', gap: 12 }, productIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, brand: { color: colors.primaryDark, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }, productName: { color: colors.ink, fontSize: 14, fontWeight: '900', marginTop: 2 }, meta: { color: colors.muted, fontSize: 11, marginTop: 3 }, store: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }, storeIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' }, storeName: { color: colors.ink, fontWeight: '900' }, typeRow: { flexDirection: 'row', gap: 9 }, type: { flex: 1, minHeight: 76, padding: 14, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, gap: 7 }, typeActive: { backgroundColor: colors.navy, borderColor: colors.navy }, typeText: { color: colors.ink, fontWeight: '800' }, typeTextActive: { color: colors.white }, toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }, toggleTitle: { color: colors.ink, fontWeight: '800', fontSize: 14 }, availability: { flexDirection: 'row', gap: 8 }, availabilityItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5, padding: 10, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }, availabilityActive: { borderColor: colors.primary, backgroundColor: colors.blueSoft }, availabilityText: { fontSize: 10, fontWeight: '800', color: colors.ink, textAlign: 'center' }, textarea: { height: 100, paddingTop: 14, textAlignVertical: 'top' }, summary: { flexDirection: 'row', alignItems: 'center', gap: 12 }, summaryTitle: { color: colors.ink, fontWeight: '900' }, summaryText: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
});
