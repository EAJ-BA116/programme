# Programme EAJ — v1.8.0

## Nouveautés

### Mode hors ligne réel
- Le Service Worker met en cache l'interface et les ressources principales de l'application.
- La dernière version du planning chargée depuis Supabase est conservée localement sur l'appareil.
- En absence de réseau, l'application affiche cette dernière copie au lieu de dépendre uniquement du planning.js livré avec le site.
- Un bandeau indique clairement quand l'application fonctionne hors connexion.
- Au retour du réseau, le planning est automatiquement réactualisé depuis Supabase.

### Journal « Dernières informations »
- Accessible depuis le menu public.
- Affiche les dernières notifications réellement envoyées (statut sent ou partial).
- Affiche le type de message, le destinataire, la date, le titre et le contenu.
- Une copie locale du journal est conservée pour consultation hors connexion après une première consultation/actualisation en ligne.
- Les données techniques d'administration, les compteurs et l'auteur admin ne sont pas exposés par le RPC public.

### Sauvegarde automatique avant publication
- Chaque clic sur « Enregistrer » dans le Super Admin crée d'abord une sauvegarde de l'état actuel du planning dans eaj_planning_backups.
- Si la sauvegarde échoue, la publication est interrompue afin de ne pas enregistrer sans filet de sécurité.
- Les sauvegardes restent disponibles dans Réglages > Maintenance avancée.

## Installation
1. Mettre en ligne les fichiers de la v1.8.0.
2. Dans Supabase > SQL Editor, exécuter une seule fois `supabase-migration-v1.8.0.sql`.
3. Aucune modification de la fonction Edge `send-eaj-push` n'est nécessaire par rapport à la v1.7.x.
4. Les utilisateurs doivent ouvrir l'application au moins une fois en ligne après la mise à jour afin que le nouveau Service Worker constitue son cache hors ligne.

## Important
Le mode hors ligne conserve les données sur chaque appareil. Vider les données du site, désinstaller la PWA ou supprimer les données du navigateur efface cette copie locale.
