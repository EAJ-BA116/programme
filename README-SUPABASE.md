# Migration Supabase — Planning EAJ BA 116

## Objectif

- Les visiteurs du site public ne se connectent jamais.
- Le planning public est lu depuis Supabase.
- Le générateur est protégé par une connexion Supabase.
- Seuls les utilisateurs présents dans `eaj_admins` peuvent modifier le planning.
- `planning.js` reste présent comme sauvegarde/fallback pendant la migration.

## Fichiers ajoutés

- `supabase-config.js` : URL + clé publique Supabase à renseigner.
- `planning-api.js` : lecture, sauvegarde, login admin et realtime.
- `supabase-setup.sql` : création des tables et règles RLS.
- `supabase-import-current-planning.sql` : import du planning actuel dans Supabase.
- `README-SUPABASE.md` : ce guide.

## Étapes Supabase

### 1. Créer le projet Supabase

Crée un projet Supabase, puis récupère :

- Project URL
- anon key / publishable key

Va ensuite dans `supabase-config.js` et remplace :

```js
url: "https://TON-PROJET.supabase.co",
anonKey: "TON_ANON_KEY_OU_PUBLISHABLE_KEY",
```

Ne mets jamais la clé `service_role` dans ce fichier.

### 2. Créer la base

Dans Supabase > SQL Editor, lance :

```sql
supabase-setup.sql
```

### 3. Importer le planning actuel

Toujours dans SQL Editor, lance ensuite :

```sql
supabase-import-current-planning.sql
```

Ça copie le contenu actuel de `planning.js` dans Supabase.

### 4. Créer l’utilisateur admin

Dans Supabase > Authentication > Users :

1. Crée l’utilisateur qui aura accès au générateur.
2. Copie son UUID.
3. Lance cette commande en remplaçant l’UUID :

```sql
insert into public.eaj_admins (user_id, display_name, active)
values ('UUID_A_REMPLACER', 'Yoann', true)
on conflict (user_id) do update
set display_name = excluded.display_name,
    active = true;
```

### 5. Activer le presque-live

Dans Supabase, active Realtime/Replication pour la table :

```txt
eaj_planning_state
```

Selon l’interface Supabase : Database > Replication / Realtime.

Tu peux aussi essayer :

```sql
alter publication supabase_realtime add table public.eaj_planning_state;
```

Si Supabase dit que la table est déjà ajoutée, ce n’est pas grave.

## Fonctionnement

### Site public

- Charge Supabase.
- Si Supabase est configuré et accessible : affiche le planning Supabase.
- Si Supabase est indisponible ou non configuré : utilise `planning.js`.

### Générateur

- Affiche une page de connexion.
- Vérifie que l’utilisateur connecté existe dans `eaj_admins`.
- Charge le planning depuis Supabase.
- Le bouton principal enregistre dans Supabase.
- Le bouton `Export planning.js secours` permet de télécharger un fichier de sauvegarde.

## Attention

Tant que `supabase-config.js` n’est pas rempli, le générateur reste verrouillé.
Le site public, lui, continue à fonctionner grâce au fallback `planning.js`.


## ⚠️ Erreur `Unexpected token '<'` ou `404: Not Found`

Si la console affiche par exemple :

```txt
planning.js:1 Uncaught SyntaxError: Unexpected token '<'
planning-api.js:2 Uncaught SyntaxError: Unexpected token ':'
```

Cela veut dire que le navigateur ne reçoit pas le vrai fichier JavaScript. À la place, il reçoit souvent une page HTML, une page 404 ou un mauvais fichier.

À vérifier :

1. Sur GitHub Pages, les fichiers `index.html`, `planning-api.js`, `supabase-config.js`, `script.js`, `style.css`, `planning.js` doivent être dans le même dossier publié.
2. N'envoie pas seulement `index.html` : il faut envoyer tous les fichiers du dossier.
3. Si tu as extrait le zip, évite de publier un dossier imbriqué du type `programme-main/programme-main/...`.
4. Ouvre directement dans le navigateur : `https://TON-SITE/planning-api.js`. Tu dois voir du code JavaScript, pas une page HTML.

La version 1.4.0 ajoute un chargeur plus robuste qui évite de tenter d'exécuter une page HTML comme du JavaScript.
