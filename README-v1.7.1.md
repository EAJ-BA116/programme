# Programme EAJ — v1.7.1

## Interface Super Admin simplifiée

Cette version ne modifie pas le schéma Supabase par rapport à la v1.7.0.

Le Super Admin est maintenant organisé en trois onglets :

- **Planning** : gestion des semaines ;
- **Notifications** : envoi des notifications push ;
- **Réglages** : fusion EAJ2/EAJ3, bannières, signature de mise à jour et maintenance.

Le bouton **Enregistrer** reste visible en haut dans tous les onglets.

Les fonctions peu utilisées ont été repliées :

- génération/export `planning.js` dans **Outils de secours** ;
- URL de notification, statistiques détaillées et historique dans **Abonnements et historique** ;
- sauvegardes/restauration/remise à zéro dans **Maintenance avancée**.

## Supabase / Push

- Si la migration **v1.7.0** a déjà été exécutée, aucune nouvelle migration SQL n'est nécessaire pour la v1.7.1.
- Si elle ne l'a pas encore été, exécuter `supabase-migration-v1.7.0.sql` après la migration v1.6.0.
- La fonction Edge `send-eaj-push` reste celle fournie avec la v1.7.x.
