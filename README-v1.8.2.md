# Programme EAJ — v1.8.2

## Modifications

- Filtres publics simplifiés : **Tous / EAJ1 / EAJ 2-3** uniquement.
- En sélectionnant **EAJ 2-3**, les sous-filtres **EAJ2** et **EAJ3** apparaissent et peuvent être activés seuls ou ensemble.
- Les fenêtres ouvertes depuis le menu restent ouvertes pendant le défilement à la molette ou au doigt.
- Le fond du mode sombre est légèrement plus sombre, tout en conservant le contraste des cartes.
- Le menu **Par activité** et ses options reprennent le thème sombre.
- Le Super Admin peut supprimer un message push de l’historique ; il disparaît aussi du journal public « Dernières informations ».

## Supabase

Après les migrations précédentes, exécuter une seule fois :

`supabase-migration-v1.8.2.sql`

Cette migration ajoute uniquement la fonction sécurisée permettant à un administrateur actif de supprimer une notification.

Aucun redéploiement de la fonction Edge `send-eaj-push` n’est nécessaire.
