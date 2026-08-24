# Notifications Push EAJ — v1.7.1

## Nouveautés

- L'utilisateur coche librement **EAJ1**, **EAJ2**, **EAJ3** et/ou **Mises à jour système**.
- Il n'existe pas de bouton « Tous » : cocher EAJ1 + EAJ2 + EAJ3 revient naturellement à recevoir les trois.
- Un inscrit **EAJ2** reçoit automatiquement les envois **EAJ2** et **EAJ 2-3**.
- Un inscrit **EAJ3** reçoit automatiquement les envois **EAJ3** et **EAJ 2-3**.
- Dès que les notifications sont actives, les **messages importants** sont toujours reçus.
- Si l'utilisateur choisit « Tout désactiver », l'abonnement est désactivé dans Supabase et supprimé du navigateur.

## Mise à jour Supabase

1. Si la v1.6.0 Push n'a jamais été installée, exécuter d'abord `supabase-migration-v1.6.0.sql`.
2. Exécuter ensuite `supabase-migration-v1.7.0.sql` dans **Supabase > SQL Editor**.
3. Remplacer / redéployer la fonction Edge **`send-eaj-push`** avec le fichier :
   `supabase/functions/send-eaj-push/index.ts`.
4. Les secrets VAPID restent identiques : `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.

## Destinataires disponibles au Super Admin

- Tous les EAJ
- EAJ1
- EAJ2 uniquement
- EAJ3 uniquement
- EAJ 2-3 (EAJ2 + EAJ3)
- Abonnés aux mises à jour système

Pour la catégorie **Important**, le destinataire est automatiquement forcé sur tous les abonnés actifs.
Pour **Mise à jour de l'application**, le destinataire est automatiquement forcé sur les abonnés « Mises à jour système ».

## Catégories de messages

- Information
- Programme / activité
- Modification
- Annulation
- Document / consigne
- Mise à jour de l'application
- Important
