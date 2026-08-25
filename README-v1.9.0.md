# Programme EAJ — v1.9.0

## Nouveautés

### Gestionnaire de sauvegardes
Dans **Super Admin > Réglages > Maintenance avancée**, le gestionnaire permet maintenant :
- de créer une sauvegarde manuelle avec un nom et un commentaire ;
- de distinguer les sauvegardes manuelles, automatiques et de sécurité ;
- de restaurer n'importe quelle sauvegarde ;
- de supprimer une sauvegarde avec confirmation ;
- de conserver la sauvegarde automatique créée avant chaque publication ;
- de créer automatiquement une sauvegarde de sécurité avant une restauration.

### Cartouche d'activité tricolore
Chaque ligne d'activité possède un choix **Style du cartouche** :
- Standard ;
- 🇫🇷 Bleu – Blanc – Rouge.

Le choix est enregistré dans le planning lui-même. Il peut donc être utilisé seulement pour certaines activités, par exemple le 8 mai, le 14 juillet ou le 11 novembre, sans modifier toutes les cérémonies.

## Supabase
Exécuter une seule fois dans **Supabase > SQL Editor** :

`supabase-migration-v1.9.0.sql`

La migration ne modifie pas le planning actuel. Elle enrichit uniquement la table de sauvegardes et autorise leur suppression par les Super Admins.
