import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, Header, Screen, SectionTitle } from '@/components/ui';
import { colors, radius } from '@/lib/theme';

const rows: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; route?: '/settings/licenses' }> = [
  { icon: 'person-outline', label: 'Compte et pseudonyme' },
  { icon: 'shield-outline', label: 'Confidentialité' },
  { icon: 'location-outline', label: 'Géolocalisation', value: 'Facultative' },
  { icon: 'language-outline', label: 'Langue', value: 'Français' },
  { icon: 'download-outline', label: 'Télécharger mes données' },
  { icon: 'document-text-outline', label: 'Sources et licences', route: '/settings/licenses' },
  { icon: 'reader-outline', label: 'CGU et confidentialité' },
  { icon: 'trash-outline', label: 'Supprimer mon compte' },
];

export default function SettingsScreen() {
  return <Screen><Header eyebrow="Contrôle" title="Vos préférences" subtitle="Vous choisissez ce qui est partagé, mesuré et notifié." />
    <SectionTitle title="Consentements" /><Card><View style={styles.toggle}><View style={styles.toggleIcon}><Ionicons name="analytics-outline" size={21} color={colors.ink} /></View><View style={{ flex: 1 }}><Text style={styles.label}>Mesure d’usage</Text><Text style={styles.description}>Désactivée tant que vous n’avez pas consenti.</Text></View><Switch value={false} /></View><View style={styles.separator} /><View style={styles.toggle}><View style={styles.toggleIcon}><Ionicons name="notifications-outline" size={21} color={colors.ink} /></View><View style={{ flex: 1 }}><Text style={styles.label}>Notifications utiles</Text><Text style={styles.description}>Baisses de prix, confirmations et badges.</Text></View><Switch value /></View></Card>
    <SectionTitle title="Compte et application" /><View style={styles.menu}>{rows.map((row) => <Pressable key={row.label} onPress={() => row.route ? router.push(row.route) : undefined} style={styles.row}><View style={styles.rowIcon}><Ionicons name={row.icon} size={20} color={row.label.includes('Supprimer') ? colors.danger : colors.ink} /></View><Text style={[styles.label, row.label.includes('Supprimer') && { color: colors.danger }]}>{row.label}</Text>{row.value ? <Text style={styles.value}>{row.value}</Text> : null}<Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>)}</View>
    <Text style={styles.footer}>PrixPéi v0.1.0 · Ce service est indépendant des enseignes référencées.</Text>
  </Screen>;
}

const styles = StyleSheet.create({ toggle: { flexDirection: 'row', alignItems: 'center', gap: 12 }, toggleIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }, label: { flex: 1, color: colors.ink, fontWeight: '800', fontSize: 14 }, description: { color: colors.muted, fontSize: 10, marginTop: 3 }, separator: { height: 1, backgroundColor: colors.line, marginVertical: 14 }, menu: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }, row: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line }, rowIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }, value: { color: colors.muted, fontSize: 11 }, footer: { color: colors.muted, textAlign: 'center', fontSize: 10, lineHeight: 15, marginHorizontal: 20 },
});
