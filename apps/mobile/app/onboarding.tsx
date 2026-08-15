import { useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ONBOARDING_KEY } from '@/lib/onboarding';
import { colors, radius } from '@/lib/theme';

const { width } = Dimensions.get('window');

const slides = [
  { icon: 'search-outline' as const, eyebrow: 'Bienvenue sur PrixPéi', title: 'Trouvez le meilleur prix près de vous.', text: 'Comparez les prix partagés par la communauté réunionnaise, magasin par magasin.', accent: colors.sunshine },
  { icon: 'barcode-outline' as const, eyebrow: 'Simple et rapide', title: 'Scannez avant de remplir votre panier.', text: 'Un code-barres suffit pour voir les prix récents et choisir où acheter.', accent: colors.white },
  { icon: 'people-outline' as const, eyebrow: 'La force du collectif', title: 'Un prix partagé aide toute l’île.', text: 'Contribuez en quelques secondes et rendez les courses plus justes pour tout le monde.', accent: colors.sunshine },
] as const;

export default function OnboardingScreen() {
  const list = useRef<FlatList<(typeof slides)[number]>>(null);
  const [index, setIndex] = useState(0);
  const finish = async () => {
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };
  const next = () => {
    if (index === slides.length - 1) void finish();
    else list.current?.scrollToIndex({ index: index + 1, animated: true });
  };
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  return <SafeAreaView style={styles.safe}><StatusBar style="light" />
    <View style={styles.brand}><View style={styles.sun}><Ionicons name="sunny" size={24} color={colors.sunshine} /></View><Text style={styles.brandName}>PrixPéi</Text><Pressable accessibilityRole="button" onPress={() => void finish()}><Text style={styles.skip}>Passer</Text></Pressable></View>
    <FlatList ref={list} data={slides} keyExtractor={(_, itemIndex) => String(itemIndex)} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={{ itemVisiblePercentThreshold: 60 }} renderItem={({ item, index: slideIndex }) => <View style={styles.slide}>
      <View style={styles.illustration}>
        <View style={[styles.ray, styles.rayOne]} /><View style={[styles.ray, styles.rayTwo]} /><View style={[styles.ray, styles.rayThree]} />
        <View style={styles.volcano}><View style={styles.volcanoSnow} /></View>
        <View style={[styles.iconCircle, { backgroundColor: item.accent }]}><Ionicons name={item.icon} size={66} color={colors.navy} /></View>
        <View style={styles.priceBubble}><Text style={styles.priceBubbleText}>{slideIndex === 0 ? '3,84 €' : slideIndex === 1 ? 'EAN ✓' : '+10 pts'}</Text></View>
      </View>
      <Text style={styles.eyebrow}>{item.eyebrow}</Text><Text style={styles.title}>{item.title}</Text><Text style={styles.text}>{item.text}</Text>
    </View>} />
    <View style={styles.footer}><View style={styles.dots}>{slides.map((_, dotIndex) => <View key={dotIndex} style={[styles.dot, dotIndex === index && styles.dotActive]} />)}</View><Pressable accessibilityRole="button" accessibilityLabel={index === slides.length - 1 ? 'Commencer' : 'Continuer'} onPress={next} style={styles.next}><Text style={styles.nextText}>{index === slides.length - 1 ? 'Commencer' : 'Continuer'}</Text><Ionicons name="arrow-forward" size={21} color={colors.navy} /></Pressable></View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary }, brand: { height: 62, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 9 }, sun: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navy }, brandName: { flex: 1, color: colors.white, fontWeight: '900', fontSize: 21, letterSpacing: -0.5 }, skip: { color: colors.white, fontWeight: '800', fontSize: 13 },
  slide: { width, paddingHorizontal: 24, alignItems: 'center' }, illustration: { width: width - 48, flex: 1, maxHeight: 410, minHeight: 300, borderRadius: radius.xl, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: 8, marginBottom: 25 }, iconCircle: { width: 154, height: 154, borderRadius: 77, alignItems: 'center', justifyContent: 'center', zIndex: 3 }, priceBubble: { position: 'absolute', right: 25, top: 40, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, backgroundColor: colors.danger, zIndex: 4 }, priceBubbleText: { color: colors.white, fontSize: 13, fontWeight: '900' }, volcano: { position: 'absolute', width: 0, height: 0, bottom: -2, left: 25, borderLeftWidth: 115, borderRightWidth: 115, borderBottomWidth: 150, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: colors.danger, opacity: 0.9 }, volcanoSnow: { position: 'absolute', width: 0, height: 0, top: 86, left: -34, borderLeftWidth: 34, borderRightWidth: 34, borderBottomWidth: 45, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: colors.sunshine }, ray: { position: 'absolute', height: 18, width: 180, borderRadius: 9, backgroundColor: colors.sunshine, opacity: 0.2 }, rayOne: { top: 55, left: -65, transform: [{ rotate: '25deg' }] }, rayTwo: { top: 125, right: -70, transform: [{ rotate: '-20deg' }] }, rayThree: { bottom: 65, right: -45, transform: [{ rotate: '18deg' }] },
  eyebrow: { color: colors.sunshine, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.4 }, title: { color: colors.white, fontSize: 30, lineHeight: 35, fontWeight: '900', letterSpacing: -0.9, textAlign: 'center', marginTop: 9 }, text: { color: '#DCE5FF', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 12, maxWidth: 340 },
  footer: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 12, gap: 19 }, dots: { flexDirection: 'row', justifyContent: 'center', gap: 7 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.35)' }, dotActive: { width: 25, backgroundColor: colors.sunshine }, next: { minHeight: 58, borderRadius: 19, backgroundColor: colors.sunshine, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, nextText: { color: colors.navy, fontSize: 16, fontWeight: '900' },
});
