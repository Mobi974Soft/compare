# Registre des sources et licences

Vérification documentaire effectuée le 3 août 2026. Une revue juridique reste nécessaire avant commercialisation.

| Source | Fonction | Documentation | Licence | Usage commercial | Attribution | Limites | Remplacement | Données transmises |
|---|---|---|---|---|---|---|---|---|
| Open Food Facts API v3.6 | Identifier un produit par GTIN et fournir une image autorisée | https://openfoodfacts.github.io/openfoodfacts-server/api/ | Base ODbL, contenu DbCL, images CC BY-SA | Oui, sous respect des licences et conditions | Visible, source et licence de l’image | 15 lectures produit/min/IP ; User-Agent dédié ; déclaration d’usage ; cache requis à l’échelle | Import quotidien/local Product Opener ou autre source dûment licenciée | GTIN, User-Agent applicatif, IP du backend |
| OpenStreetMap | Données géographiques | https://www.openstreetmap.org/copyright | ODbL | Oui | « © contributeurs OpenStreetMap » | Ne pas utiliser les tuiles/Nominatim publics gratuits pour un service commercial à volume | Fournisseur commercial OSM ou Nominatim/Photon/Pelias auto-hébergé | Zone/cartes demandées ; jamais de trajectoire utilisateur |

## Règles bloquantes

- Aucune source n’est activée si URL, licence, autorisation commerciale, attribution et date de vérification sont incomplètes dans `data_sources`.
- Aucun scraping de magasin ou fabricant.
- Aucune image issue de Google Images ou d’une licence inconnue.
- Aucun logo d’enseigne ni allégation de partenariat sans autorisation.
- La source peut être désactivée immédiatement ; la dernière donnée valide reste consultable avec sa date et son attribution.
