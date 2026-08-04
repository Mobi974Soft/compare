# Exploitation et procédures

## Désactiver une source

```sql
update public.data_sources set is_enabled = false, updated_at = now() where name = 'Open Food Facts';
```

L’Edge Function arrête les appels externes et rend le dernier cache valide disponible lorsqu’il existe.

## Rotation des secrets

1. Créer le nouveau secret chez le fournisseur.
2. `supabase secrets set NOM=nouvelle_valeur`.
3. Redéployer les fonctions concernées.
4. Vérifier erreurs et latence.
5. Révoquer l’ancien secret.
6. Journaliser l’opération sans stocker la valeur.

## Sauvegardes

- Activer PITR selon le plan Supabase.
- Tester une restauration au moins trimestriellement.
- Exporter séparément les décisions de modération et le registre de licences.
- Chiffrer et restreindre les sauvegardes ; documenter la conservation.

## CI/CD

La CI vérifie TypeScript, tests et builds. Le déploiement de migrations doit être séparé, protégé par environnement et précédé d’une sauvegarde pour toute migration destructive.
