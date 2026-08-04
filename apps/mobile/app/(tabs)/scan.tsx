import { useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { barcodeSchema } from '@prixpei/validation';
import { Button, Field, Screen } from '@/components/ui';
import { colors, radius } from '@/lib/theme';
import { useAppStore } from '@/store/app';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState('3017620422003');
  const [torch, setTorch] = useState(false);
  const locked = useRef(false);
  const addRecentBarcode = useAppStore((state) => state.addRecentBarcode);

  const openBarcode = (raw: string) => {
    const result = barcodeSchema.safeParse(raw);
    if (!result.success) return Alert.alert('Code invalide', 'Vérifiez le code EAN/GTIN puis réessayez.');
    addRecentBarcode(result.data);
    router.push(`/product/${result.data}`);
  };
  const handleScan = ({ data }: BarcodeScanningResult) => {
    if (locked.current) return;
    locked.current = true;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    openBarcode(data);
    setTimeout(() => { locked.current = false; }, 1400);
  };

  if (!permission?.granted) return <Screen><View style={styles.permission}><View style={styles.permissionIcon}><Ionicons name="camera" size={38} color={colors.primary} /></View><Text style={styles.permissionTitle}>Prêt à scanner ?</Text><Text style={styles.permissionText}>La caméra sert uniquement à lire le code-barres. Vous pourrez aussi le saisir manuellement.</Text><Button label="Autoriser la caméra" icon="camera" onPress={() => void requestPermission()} /><Button label="Saisir le code" variant="secondary" onPress={() => openBarcode(manual)} /></View></Screen>;

  return <View style={styles.root}>
    <CameraView style={StyleSheet.absoluteFill} facing="back" enableTorch={torch} onBarcodeScanned={handleScan} barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }} />
    <View style={styles.overlay}><View style={styles.scanHeader}><Pressable onPress={() => router.back()} style={styles.round}><Ionicons name="close" size={24} color={colors.white} /></Pressable><Text style={styles.headTitle}>Scanner le code-barres</Text><Pressable onPress={() => setTorch((value) => !value)} style={[styles.round, torch && styles.roundActive]}><Ionicons name={torch ? 'flash' : 'flash-off'} size={22} color={colors.white} /></Pressable></View><View style={styles.focus}><View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} /><View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} /><View style={styles.laser} /></View><Text style={styles.help}>Placez le code-barres dans le cadre</Text><View style={styles.manualCard}><Field label="Ou saisir le code manuellement" keyboardType="number-pad" value={manual} onChangeText={setManual} /><Button label="Rechercher" icon="search" onPress={() => openBarcode(manual)} /></View></View>
  </View>;
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.black }, overlay: { flex: 1, padding: 20, paddingTop: Platform.OS === 'ios' ? 62 : 36, backgroundColor: 'rgba(8,18,15,.38)' }, scanHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, round: { width: 46, height: 46, borderRadius: 18, backgroundColor: 'rgba(0,0,0,.35)', alignItems: 'center', justifyContent: 'center' }, roundActive: { backgroundColor: colors.primary }, headTitle: { color: colors.white, fontSize: 16, fontWeight: '900' }, focus: { width: '88%', maxWidth: 360, aspectRatio: 1.4, alignSelf: 'center', marginTop: '30%', position: 'relative' }, corner: { position: 'absolute', width: 42, height: 42, borderColor: colors.white }, tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 18 }, tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 18 }, bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 18 }, br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 18 }, laser: { position: 'absolute', height: 2, left: 18, right: 18, top: '50%', backgroundColor: colors.primary }, help: { color: colors.white, textAlign: 'center', fontWeight: '700', marginTop: 22 }, manualCard: { marginTop: 'auto', backgroundColor: colors.background, padding: 18, borderRadius: radius.lg, gap: 13 }, permission: { paddingTop: 90, alignItems: 'center', gap: 17 }, permissionIcon: { width: 82, height: 82, borderRadius: 28, backgroundColor: '#FFE5E0', alignItems: 'center', justifyContent: 'center' }, permissionTitle: { fontSize: 27, fontWeight: '900', color: colors.ink }, permissionText: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', maxWidth: 320, marginBottom: 10 },
});
