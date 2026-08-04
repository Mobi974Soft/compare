# Modèle de menace

| Risque | Impact | Défenses présentes / prévues |
|---|---|---|
| Modification directe des points | Élevé | RLS, trigger de protection, Edge Functions avec audit |
| Validation de sa propre contribution | Élevé | Politique RLS indépendante et contrainte unique |
| Spam de prix | Élevé | Limite glissante, déduplication, quarantaine, CAPTCHA adaptatif à ajouter |
| Comptes coordonnés | Élevé | Signaux privés, graphes de validation, revue manuelle |
| Exposition de position | Critique | aucun historique GPS, magasin seulement, agrégation locale |
| Injection / payload malformé | Élevé | Zod client, validation serveur indépendante, requêtes paramétrées |
| Secret embarqué | Critique | clé publique seulement ; service role dans les secrets Edge |
| Source externe compromise | Élevé | allowlist d’hôtes, timeout, normalisation, cache, désactivation immédiate |
| Abus administrateur | Critique | rôles, audit immuable, moindre privilège, MFA à imposer |
| Données privées lues par invité | Critique | RLS partout, vues publiques limitées, tests pgTAP |

## Avant production

Audit RLS automatisé, tests d’abus des fonctions, MFA obligatoire admin, rotation des secrets, CSP de l’administration, chiffrement des sauvegardes, revue des dépendances et test d’intrusion.
