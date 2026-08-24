# Notifications push EAJ — installation v1.6.0

La v1.6.0 contient le système complet côté site et Super Admin. Il reste **3 opérations uniques** à faire dans Supabase pour activer l’envoi réel.

## 1. Créer les tables et RPC

Dans **Supabase > SQL Editor**, exécuter :

`supabase-migration-v1.6.0.sql`

Cette migration ne touche pas au planning existant.

## 2. Générer une paire de clés VAPID

Sur un PC avec Node.js, depuis le dossier du site :

```bash
node generate-vapid-keys.mjs
```

Le petit outil fourni dans la v1.6.0 ne contacte aucun service externe et affiche :

- **Public Key** : elle peut être publique ;
- **Private Key** : elle doit rester secrète et ne doit jamais être envoyée sur GitHub Pages.

Dans `supabase-config.js`, remplacer :

```js
pushPublicKey: "A_REMPLACER_PAR_LA_CLE_PUBLIQUE_VAPID"
```

par la **Public Key**.

## 3. Déployer la fonction Edge d’envoi

Le dossier est déjà fourni :

`supabase/functions/send-eaj-push/index.ts`

Avec la CLI Supabase connectée au projet :

```bash
supabase functions deploy send-eaj-push
```

Puis enregistrer les secrets :

```bash
supabase secrets set VAPID_PUBLIC_KEY="TA_CLE_PUBLIQUE"
supabase secrets set VAPID_PRIVATE_KEY="TA_CLE_PRIVEE"
supabase secrets set VAPID_SUBJECT="mailto:adresse-contact@example.fr"
```

Le `VAPID_SUBJECT` sert uniquement d’identification technique du propriétaire du service Push. Utiliser une adresse de contact valide.

## Fonctionnement

- Un visiteur ouvre le menu du site et choisit **🔔 Activer les notifications**.
- Le navigateur demande son autorisation ; rien n’est activé automatiquement.
- L’abonnement est enregistré dans Supabase.
- Dans le **Super Admin > Notifications push**, l’admin choisit le type, le titre et le message, puis clique sur **Envoyer la notification**.
- L’historique indique le nombre d’envois réussis / échoués.
- Un abonnement devenu invalide est automatiquement désactivé après une réponse Push 404/410.

## Compatibilité

- Android / Chrome et navigateurs compatibles Web Push : fonctionnement normal via HTTPS.
- iPhone / iPad : les notifications Web Push nécessitent une version récente d’iOS/iPadOS et, selon le navigateur, l’application web installée sur l’écran d’accueil.
- GitHub Pages convient car le site est servi en HTTPS.
