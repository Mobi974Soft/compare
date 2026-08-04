import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button, Card, Field, Screen } from '@/components/ui';
import { colors, radius } from '@/lib/theme';
import { useSessionStore } from '@/store/session';

export default function AuthScreen() {
  const [email, setEmail] = useState('demo@prixpei.fr');
  const [alias, setAlias] = useState('MonPseudo');
  const [accepted, setAccepted] = useState(false);
  const session = useSessionStore();
  const finish = () => {
    if (!accepted || alias.trim().length < 3) return Alert.alert('Encore une étape', 'Choisissez un pseudonyme et acceptez les conditions pour continuer.');
    session.signInDemo(alias.trim());
    const target = session.pendingAction?.path ?? '/profile';
    session.setPendingAction(null);
    router.replace(target);
  };
  return <Screen><View style={styles.hero}><View style={styles.logo}><Text style={styles.logoText}>P</Text></View><Text style={styles.title}>Rejoignez les éclaireurs</Text><Text style={styles.subtitle}>{session.pendingAction ? `Créez un compte en quelques secondes pour ${session.pendingAction.label}.` : 'Vos signalements rendent les prix plus utiles pour tout le monde.'}</Text></View>
    <View style={styles.social}><Button label="Continuer avec Apple" icon="logo-apple" variant="dark" onPress={finish} /><Button label="Continuer avec Google" icon="logo-google" variant="secondary" onPress={finish} /></View>
    <View style={styles.separator}><View style={styles.line} /><Text style={styles.or}>ou par email</Text><View style={styles.line} /></View>
    <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
    <Field label="Pseudonyme public" value={alias} onChangeText={setAlias} autoCapitalize="none" />
    <Pressable onPress={() => setAccepted((value) => !value)} style={styles.accept}><View style={[styles.checkbox, accepted && styles.checkboxActive]}>{accepted ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}</View><Text style={styles.acceptText}>J’ai l’âge minimum requis et j’accepte les CGU ainsi que la politique de confidentialité.</Text></Pressable>
    <Button label="Recevoir un magic link" icon="mail" onPress={finish} />
    <Card tone="mint"><Text style={styles.privacy}>🔒 Votre email, votre nom légal et votre position exacte ne sont jamais affichés publiquement.</Text></Card>
  </Screen>;
}

const styles = StyleSheet.create({ hero: { alignItems: 'center', paddingVertical: 18 }, logo: { width: 74, height: 74, borderRadius: 27, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] }, logoText: { color: colors.white, fontSize: 37, fontWeight: '900' }, title: { color: colors.ink, fontSize: 27, fontWeight: '900', textAlign: 'center', marginTop: 20 }, subtitle: { color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 8, maxWidth: 340 }, social: { gap: 9 }, separator: { flexDirection: 'row', alignItems: 'center', gap: 10 }, line: { height: 1, backgroundColor: colors.line, flex: 1 }, or: { color: colors.muted, fontSize: 11 }, accept: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' }, checkbox: { width: 23, height: 23, borderRadius: 7, borderWidth: 1, borderColor: '#B8C0BC', backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary }, acceptText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 }, privacy: { color: colors.ink, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
