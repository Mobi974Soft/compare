import type { PropsWithChildren, ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow } from '@/lib/theme';

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {scroll ? <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView> : <View style={styles.flex}>{children}</View>}
    </SafeAreaView>
  );
}

export function Header({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return <View style={styles.header}>
    <View style={styles.headerText}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>
    {action}
  </View>;
}

export function Card({ children, tone = 'white', style }: PropsWithChildren<{ tone?: 'white' | 'mint' | 'sun'; style?: object }>) {
  return <View style={[styles.card, tone === 'mint' && styles.cardMint, tone === 'sun' && styles.cardSun, style]}>{children}</View>;
}

export function Button({ label, onPress, icon, variant = 'primary', loading = false, disabled = false }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap; variant?: 'primary' | 'secondary' | 'ghost' | 'dark'; loading?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, styles[`button_${variant}`], (pressed || disabled) && styles.pressed]}>
    {loading ? <ActivityIndicator color={variant === 'primary' || variant === 'dark' ? colors.white : colors.ink} /> : <>{icon ? <Ionicons name={icon} size={20} color={variant === 'primary' || variant === 'dark' ? colors.white : colors.ink} /> : null}<Text style={[styles.buttonText, (variant === 'primary' || variant === 'dark') && styles.buttonTextLight]}>{label}</Text></>}
  </Pressable>;
}

export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string | undefined }) {
  return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput placeholderTextColor="#98A19D" style={[styles.input, error && styles.inputError]} {...props} />{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
}

export function Pill({ label, tone = 'neutral', icon }: { label: string; tone?: 'neutral' | 'green' | 'coral' | 'yellow'; icon?: keyof typeof Ionicons.glyphMap }) {
  return <View style={[styles.pill, styles[`pill_${tone}`]]}>{icon ? <Ionicons name={icon} size={13} color={colors.ink} /> : null}<Text style={styles.pillText}>{label}</Text></View>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionTitle}><Text style={styles.sectionLabel}>{title}</Text>{action ? <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, flex: { flex: 1 }, content: { padding: 20, paddingBottom: 120, gap: 18 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginTop: 8 }, headerText: { flex: 1 },
  eyebrow: { fontSize: 12, fontWeight: '800', color: colors.primaryDark, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 5 },
  title: { fontSize: 32, lineHeight: 37, fontWeight: '900', color: colors.ink, letterSpacing: -1.1 }, subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 7 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: '#EEF0EC', ...shadow }, cardMint: { backgroundColor: '#E7F8EF', borderColor: '#D5F0E2' }, cardSun: { backgroundColor: '#FFF5D9', borderColor: '#FBE9BA' },
  button: { minHeight: 52, paddingHorizontal: 20, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  button_primary: { backgroundColor: colors.primary }, button_secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }, button_ghost: { backgroundColor: 'transparent' }, button_dark: { backgroundColor: colors.ink }, pressed: { opacity: 0.67, transform: [{ scale: 0.985 }] },
  buttonText: { color: colors.ink, fontWeight: '800', fontSize: 15 }, buttonTextLight: { color: colors.white },
  fieldWrap: { gap: 7 }, fieldLabel: { color: colors.ink, fontSize: 13, fontWeight: '800' }, input: { minHeight: 52, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.white, color: colors.ink, borderWidth: 1, borderColor: colors.line, fontSize: 16 }, inputError: { borderColor: colors.danger }, error: { color: colors.danger, fontSize: 12 },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#EEF1EE' }, pill_neutral: { backgroundColor: '#EEF1EE' }, pill_green: { backgroundColor: colors.mint }, pill_coral: { backgroundColor: '#FFE0DB' }, pill_yellow: { backgroundColor: '#FFE9A8' }, pillText: { fontSize: 11, fontWeight: '800', color: colors.ink },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }, sectionLabel: { fontSize: 19, fontWeight: '900', color: colors.ink, letterSpacing: -0.3 }, sectionAction: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
});
