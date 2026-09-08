# Programme EAJ - v1.9.2

## Export PDF par période

Le Super Admin dispose maintenant de trois exports PDF indépendants dans l’onglet **Planning** :

- **Septembre à décembre** ;
- **Janvier à mars** ;
- **Avril à juin**.

Chaque bouton télécharge **un PDF distinct d’une seule page**. L’export :

- reconstitue toutes les semaines de la période, même lorsqu’aucune activité n’est programmée ;
- regroupe les événements exceptionnels du même calendrier hebdomadaire ;
- affiche le contenu EAJ1, EAJ2/EAJ3/EAJ 2-3 et les activités communes / informations ;
- ajoute en bas la date et l’heure d’export ;
- réserve une zone pour la **signature du responsable des EAJ** ;
- utilise l’A4 paysage quand le contenu tient lisiblement sur une page et bascule en A3 paysage si nécessaire pour ne rien couper.

L’année EAJ est déterminée automatiquement à partir des dates du planning (septembre N à juin N+1).

## Technique

La génération PDF côté navigateur utilise jsPDF 4.2.1 chargé depuis jsDelivr. En cas d’indisponibilité de cette bibliothèque, le reste du Super Admin reste fonctionnel et un message d’erreur est affiché uniquement lors de l’export PDF.
