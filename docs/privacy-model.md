# Modèle de confidentialité

## Minimisation

- Profil public : pseudonyme, label de réputation, badges et rang lorsque la population locale est suffisante.
- Email, identité légale, signaux antifraude, IP, jetons et position exacte : jamais publics.
- Localisation : utilisée en mémoire pour la proximité ; le serveur reçoit la position uniquement pour la requête courante. Les contributions conservent le magasin, pas la trace GPS.
- Analytics et notifications : opt-in par finalité.

## Droits

- Export : profil, préférences, acceptations, contributions, validations, commentaires, score et sanctions communicables.
- Suppression : révoquer les sessions et jetons ; supprimer les identifiants directs ; anonymiser les contributions lorsque leur conservation est légitime ; conserver les seuls journaux nécessaires.
- Rectification : corrections séparées pour les données provenant d’une source externe.

## Conservation indicative

| Donnée | Durée cible |
|---|---|
| Position de recherche | mémoire de la requête uniquement |
| Jeton push | jusqu’à révocation ou 12 mois d’inactivité |
| Signal antifraude | durée proportionnée au risque, revue trimestrielle |
| Audit administratif | selon obligation et politique interne documentée |
| Compte supprimé | anonymisation immédiate, purge technique planifiée |

Les durées finales doivent être validées avec le DPO/conseil juridique.
