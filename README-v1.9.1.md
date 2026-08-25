# Programme EAJ — v1.9.1

## Gestion des sauvegardes : contenu visible

Chaque sauvegarde affiche désormais automatiquement :

- le nombre d’entrées/semaine enregistrées dans la sauvegarde ;
- la plage de semaines ISO couverte ;
- l’année, ou les deux années si la sauvegarde traverse une année scolaire.

Exemples :

- `15 semaines • semaines 14 à 38 • 2026`
- `1 semaine • semaine 46 • 2026`
- `38 semaines • S36/2026 → S25/2027`

Les informations sont calculées à partir du contenu réel (`planning.semaines`) de chaque sauvegarde, y compris pour les anciennes sauvegardes.

## Supabase

Aucune nouvelle migration Supabase n’est nécessaire pour passer de la v1.9.0 à la v1.9.1.
