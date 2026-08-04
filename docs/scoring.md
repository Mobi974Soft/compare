# Confiance, points et réputation

## Confiance d’un prix

Le score public est borné de 0 à 100 :

```text
35
+ réputation_auteur × 0,20
+ confirmations fiables et récentes (plafond 35)
− décroissance selon âge, catégorie et promotion
− contestations pondérées
− anomalie statistique
```

Libellés : 80–100 élevée ; 60–79 probablement valide ; 40–59 à confirmer ; 20–39 ancienne ou contestée ; 0–19 probablement périmée. Le score est une aide, jamais une certitude.

## Points

Un signalement crée d’abord un événement provisoire. Une tâche serveur le valide après confirmations indépendantes ou contrôle automatisé. Les malus sont des événements séparés et auditables. Le client ne modifie jamais les totaux.

## Réputation

Distincte des points. Elle combine taux de confirmation, contestations, diversité de magasins, cohérence temporelle, ancienneté, décisions de modération et signaux coordonnés. Le score antifraude détaillé n’est jamais public.
