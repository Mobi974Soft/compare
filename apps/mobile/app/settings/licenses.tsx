import { Linking, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Header, Pill, Screen } from '@/components/ui';
import { colors } from '@/lib/theme';

const sources = [
  { name: 'Open Food Facts', type: 'Produits et images', license: 'ODbL · DbCL · CC BY-SA (images)', url: 'https://openfoodfacts.github.io/openfoodfacts-server/api/', verified: '3 août 2026', active: true, note: 'Attribution et partage à l’identique selon le contenu.' },
  { name: 'OpenStreetMap', type: 'Données cartographiques', license: 'Open Database License', url: 'https://www.openstreetmap.org/copyright', verified: '3 août 2026', active: true, note: 'Attribution © contributeurs OpenStreetMap. Fournisseur commercial requis en production.' },
];

export default function LicensesScreen() {
  return <Screen><Header eyebrow="Transparence" title="Sources et licences" subtitle="Chaque source externe doit être enregistrée, vérifiée et désactivable indépendamment." />
    {sources.map((source) => <Card key={source.name}><View style={styles.top}><Text style={styles.name}>{source.name}</Text><Pill label={source.active ? 'Active' : 'Désactivée'} tone={source.active ? 'green' : 'neutral'} /></View><Text style={styles.type}>{source.type}</Text><View style={styles.item}><Text style={styles.label}>Licence</Text><Text style={styles.value}>{source.license}</Text></View><View style={styles.item}><Text style={styles.label}>Vérifiée le</Text><Text style={styles.value}>{source.verified}</Text></View><Text style={styles.note}>{source.note}</Text><Button label="Documentation officielle" variant="secondary" onPress={() => void Linking.openURL(source.url)} /></Card>)}
    <Card tone="sun"><Text style={styles.warning}>Aucun scraping de site marchand, aucune image issue d’une recherche web générale et aucun logo d’enseigne sans autorisation.</Text></Card>
  </Screen>;
}

const styles = StyleSheet.create({ top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, name: { color: colors.ink, fontSize: 19, fontWeight: '900' }, type: { color: colors.primaryDark, fontSize: 11, fontWeight: '800', marginTop: 4, marginBottom: 15 }, item: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 7, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line }, label: { color: colors.muted, fontSize: 11 }, value: { flex: 1, color: colors.ink, fontSize: 11, fontWeight: '700', textAlign: 'right' }, note: { color: colors.muted, fontSize: 11, lineHeight: 17, marginVertical: 12 }, warning: { color: colors.ink, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
