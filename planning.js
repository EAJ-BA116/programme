// ⚠️ Bannière d’alerte globale
const ALERT_BANNER = {
  "actif": true,
  "texte": "⚠️ Prochaines scéances, pensez aux cheques pour l'inscription CSA. Les pass sport ne seront plus pris fin décembre 2025"
};

// 📝 Dernière mise à jour (affichée dans le footer)
const LAST_UPDATE = {
  "auteur": "Yoann",
  "dateTexte": "29/11/2025"
};

// 🗓️ LISTE DES SEMAINES / ÉVÉNEMENTS (isoDate au format AAAA-MM-JJ)
const SEMAINES = [
  {
    "isoDate": "2025-09-24",
    "date": "Mercredi 24 septembre 2025",
    "statut": "session",
    "note": "Séance de rentrée : présentation des encadrants, consignes et découverte de la base.",
    "messageOff": "",
    "activitesCommunes": [
      {
        "groupes": [
          "EAJ1",
          "EAJ2",
          "EAJ3"
        ],
        "horaire": "14h00 – 14h45",
        "lieu": "Salle de briefing",
        "encadrant": "Équipe EAJ",
        "tag": "Accueil & sécurité",
        "activites": [
          {
            "type": "autre",
            "texte": "Accueil, rappel des règles de sécurité et présentation de l’année."
          }
        ]
      }
    ],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h45 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo, gourde",
        "encadrant": "Sgt Dupont",
        "tag": "Découverte BIA",
        "activites": [
          {
            "type": "bia",
            "texte": "Introduction au BIA : présentation des thèmes de l’année."
          },
          {
            "type": "projet",
            "texte": "Jeu de questions/réponses sur l’aviation."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h45 – 17h00",
        "lieu": "Salle informatique",
        "tenue": "Tenue civile correcte",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Découverte base aérienne",
        "activites": [
          {
            "type": "projet",
            "texte": "Mini-quiz numérique sur l’histoire de la BA 116."
          },
          {
            "type": "rencontres",
            "texte": "Échanges avec un ancien EAJ revenant témoigner."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h45 – 17h00",
        "lieu": "Extérieur / parcours",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, casquette selon météo",
        "encadrant": "CNE Durand",
        "tag": "Cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Jeux de cohésion en équipe sur le terrain de sport."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2025-10-01",
    "date": "Mercredi 1 octobre 2025",
    "statut": "session",
    "note": "Séance centrée sur le BIA et la découverte technique.",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h00 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "encadrant": "Sgt Dupont",
        "tag": "BIA – Météo",
        "activites": [
          {
            "type": "bia",
            "texte": "Cours BIA : bases de la météorologie aéronautique."
          },
          {
            "type": "autre",
            "texte": "Travail en petits groupes sur des cartes météo."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h00 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Technique & maquette",
        "activites": [
          {
            "type": "aeromodelisme",
            "texte": "Montage d’une aile de planeur en équipe."
          },
          {
            "type": "projet",
            "texte": "Présentation du projet d’année (maquette commune)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h00 – 17h00",
        "lieu": "Extérieur / terrain de sport",
        "tenue": "Tenue de sport",
        "encadrant": "CNE Durand",
        "tag": "Sport & cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Parcours de motricité et jeux d’opposition contrôlée."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2025-10-08",
    "date": "Mercredi 8 octobre 2025",
    "statut": "session",
    "note": "Séance de mi-trimestre : activités variées selon les groupes.",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA – Aérodynamique",
        "activites": [
          {
            "type": "bia",
            "texte": "Cours BIA : aérodynamique (profil d’aile)."
          },
          {
            "type": "projet",
            "texte": "Atelier maquette : observation de profils."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Maquette – Structure",
        "activites": [
          {
            "type": "aeromodelisme",
            "texte": "Collage et renforts de la structure d’aile."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Sport / cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Séance de sport / cohésion (jeu collectif)."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2025-10-15",
    "date": "Mercredi 15 octobre 2025",
    "statut": "session",
    "note": "Séance de mi-trimestre : activités variées selon les groupes.",
    "messageOff": "",
    "activitesCommunes": [
      {
        "groupes": [
          "EAJ1",
          "EAJ2",
          "EAJ3"
        ],
        "horaire": "14h00 – 14h30",
        "lieu": "Salle de briefing",
        "encadrant": "Équipe EAJ",
        "tag": "Point d’étape",
        "activites": [
          {
            "type": "autre",
            "texte": "Rappel du planning et point sur les projets de chaque groupe."
          }
        ]
      }
    ],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "Visite base",
        "activites": [
          {
            "type": "visite",
            "texte": "Visite rapide d’un hangar avion (sous réserve disponibilité)."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet",
        "activites": [
          {
            "type": "projet",
            "texte": "Atelier projet / maquette (avancement)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Sport / cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Séance de sport / cohésion (jeu collectif)."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2025-10-22",
    "date": "Mercredi 22 octobre 2025",
    "statut": "session",
    "note": "Séance de mi-trimestre : activités variées selon les groupes.",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA",
        "activites": [
          {
            "type": "bia",
            "texte": "Séance de cours BIA (thème à préciser)."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet",
        "activites": [
          {
            "type": "projet",
            "texte": "Atelier projet / maquette (avancement)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Visite escadron",
        "activites": [
          {
            "type": "visite",
            "texte": "Visite d’un escadron ou atelier (sous réserve)."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2025-10-29",
    "date": "Mercredi 29 octobre 2025",
    "statut": "off",
    "note": "Semaine sans séance EAJ (vacances scolaires / contraintes base).",
    "messageOff": "Pas de séance EAJ cette semaine. Reprise lors de la prochaine date indiquée.",
    "activitesCommunes": [],
    "groupes": []
  },
  {
    "isoDate": "2025-11-05",
    "date": "Mercredi 5 novembre 2025",
    "statut": "session",
    "note": "Séance de reprise après les vacances de Toussaint.",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA – Performances",
        "activites": [
          {
            "type": "bia",
            "texte": "Cours BIA : performances et limitations d’un avion."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet",
        "activites": [
          {
            "type": "projet",
            "texte": "Atelier projet / maquette (avancement)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Sport / cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Séance de sport / cohésion (jeu collectif)."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2025-11-11",
    "date": "Mardi 11 novembre 2025 – Cérémonie de l’Armistice",
    "statut": "session",
    "note": "Cérémonie officielle de l’Armistice du 11 novembre (hors mercredi).",
    "messageOff": "",
    "activitesCommunes": [
      {
        "groupes": [
          "EAJ1",
          "EAJ2",
          "EAJ3"
        ],
        "horaire": "09h30 – 11h30",
        "lieu": "Monument aux morts de la ville",
        "tenue": "Tenue correcte exigée (pantalon sombre, haut uni si possible)",
        "materiel": "Veste chaude, éventuellement parapluie",
        "encadrant": "Équipe EAJ",
        "tag": "Devoir de mémoire",
        "activites": [
          {
            "type": "ceremonie",
            "texte": "Participation à la cérémonie officielle et minute de silence."
          },
          {
            "type": "devoirMemoire",
            "texte": "Lecture de textes et dépôt de gerbe par des volontaires EAJ."
          }
        ]
      }
    ],
    "groupes": []
  },
  {
    "isoDate": "2025-11-12",
    "date": "Mercredi 12 novembre 2025",
    "statut": "session",
    "note": "Séances d’automne, préparation des projets et sorties.",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "Projet BIA",
        "activites": [
          {
            "type": "projet",
            "texte": "Travail sur les fiches d’objectifs individuels BIA."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet",
        "activites": [
          {
            "type": "projet",
            "texte": "Atelier projet / maquette (avancement)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Sport / cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Séance de sport / cohésion (jeu collectif)."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2025-11-19",
    "date": "Mercredi 19 novembre 2025",
    "statut": "session",
    "note": "Séances d’automne, préparation des projets et sorties.",
    "messageOff": "",
    "activitesCommunes": [
      {
        "groupes": [
          "EAJ1",
          "EAJ2",
          "EAJ3"
        ],
        "horaire": "14h00 – 14h30",
        "lieu": "Salle de briefing",
        "encadrant": "Équipe EAJ",
        "tag": "Point d’étape",
        "activites": [
          {
            "type": "autre",
            "texte": "Rappel du planning et point sur les projets de chaque groupe."
          }
        ]
      }
    ],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA",
        "activites": [
          {
            "type": "bia",
            "texte": "Séance de cours BIA (thème à préciser)."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet",
        "activites": [
          {
            "type": "projet",
            "texte": "Atelier projet / maquette (avancement)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Sport / cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Séance de sport / cohésion (jeu collectif)."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2025-11-26",
    "date": "Mercredi 26 novembre 2025",
    "statut": "session",
    "note": "Séances d’automne, préparation des projets et sorties.",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA",
        "activites": [
          {
            "type": "bia",
            "texte": "Séance de cours BIA (thème à préciser)."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet",
        "activites": [
          {
            "type": "projet",
            "texte": "Atelier projet / maquette (avancement)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Découverte tir",
        "activites": [
          {
            "type": "tir",
            "texte": "Présentation du stand de tir et règles de sécurité.",
            "lieu": "Stand de tir (si disponible)"
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2025-12-03",
    "date": "Mercredi 3 décembre 2025",
    "statut": "session",
    "note": "Séance BIA et technique. EAJ3 non convoqué.",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA – Navigation",
        "activites": [
          {
            "type": "bia",
            "texte": "Cours BIA : navigation (lecture de carte)."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet",
        "activites": [
          {
            "type": "projet",
            "texte": "Atelier projet / maquette (avancement)."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2025-12-10",
    "date": "Mercredi 10 décembre 2025",
    "statut": "session",
    "note": "Séances de fin d’année civile.",
    "messageOff": "",
    "activitesCommunes": [
      {
        "groupes": [
          "EAJ1",
          "EAJ3"
        ],
        "horaire": "14h00 – 16h00",
        "lieu": "Salle de cinéma base",
        "encadrant": "CNE Durand",
        "tag": "Rencontre témoins",
        "activites": [
          {
            "type": "rencontres",
            "texte": "Projection / témoignage sur le métier de pilote de chasse."
          },
          {
            "type": "projet",
            "texte": "Débat et questions avec les jeunes."
          }
        ]
      }
    ],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA",
        "activites": [
          {
            "type": "bia",
            "texte": "Séance de cours BIA (thème à préciser)."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Drone – Simulateur",
        "activites": [
          {
            "type": "drone",
            "texte": "Premiers vols sur simulateur, règles de sécurité."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "REX pilote",
        "activites": [
          {
            "type": "autre",
            "texte": "Préparation d’un retour d’expérience sur la rencontre pilote."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2025-12-17",
    "date": "Mercredi 17 décembre 2025",
    "statut": "session",
    "note": "Séances de fin d’année civile.",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA",
        "activites": [
          {
            "type": "bia",
            "texte": "Séance de cours BIA (thème à préciser)."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet",
        "activites": [
          {
            "type": "projet",
            "texte": "Atelier projet / maquette (avancement)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Sport / cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Séance de sport / cohésion (jeu collectif)."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2025-12-24",
    "date": "Mercredi 24 décembre 2025",
    "statut": "off",
    "note": "Semaine sans séance EAJ (vacances scolaires / contraintes base).",
    "messageOff": "Pas de séance EAJ cette semaine. Reprise lors de la prochaine date indiquée.",
    "activitesCommunes": [],
    "groupes": []
  },
  {
    "isoDate": "2025-12-31",
    "date": "Mercredi 31 décembre 2025",
    "statut": "off",
    "note": "Semaine sans séance EAJ (vacances scolaires / contraintes base).",
    "messageOff": "Pas de séance EAJ cette semaine. Reprise lors de la prochaine date indiquée.",
    "activitesCommunes": [],
    "groupes": []
  },
  {
    "isoDate": "2026-01-07",
    "date": "Mercredi 7 janvier 2026",
    "statut": "session",
    "note": "Séance de reprise. EAJ1 non convoqué (effectif réduit).",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet",
        "activites": [
          {
            "type": "projet",
            "texte": "Atelier projet / maquette (avancement)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Sport / cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Séance de sport / cohésion (jeu collectif)."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2026-01-14",
    "date": "Mercredi 14 janvier 2026",
    "statut": "session",
    "note": "Séances de reprise après les vacances d’hiver.",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA – Révisions",
        "activites": [
          {
            "type": "bia",
            "texte": "Révisions générales BIA après vacances."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet technique",
        "activites": [
          {
            "type": "projet",
            "texte": "Préparation d’un exposé technique (binômes)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Sport / cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Séance de sport / cohésion (jeu collectif)."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2026-01-21",
    "date": "Mercredi 21 janvier 2026",
    "statut": "session",
    "note": "Séances de reprise après les vacances d’hiver.",
    "messageOff": "",
    "activitesCommunes": [
      {
        "groupes": [
          "EAJ1",
          "EAJ2",
          "EAJ3"
        ],
        "horaire": "14h00 – 14h30",
        "lieu": "Salle de briefing",
        "encadrant": "Équipe EAJ",
        "tag": "Point d’étape",
        "activites": [
          {
            "type": "autre",
            "texte": "Rappel du planning et point sur les projets de chaque groupe."
          }
        ]
      }
    ],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA",
        "activites": [
          {
            "type": "bia",
            "texte": "Séance de cours BIA (thème à préciser)."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet",
        "activites": [
          {
            "type": "projet",
            "texte": "Atelier projet / maquette (avancement)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Sport / cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Séance de sport / cohésion (jeu collectif)."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2026-01-28",
    "date": "Mercredi 28 janvier 2026",
    "statut": "session",
    "note": "Séances de reprise après les vacances d’hiver.",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA",
        "activites": [
          {
            "type": "bia",
            "texte": "Séance de cours BIA (thème à préciser)."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet",
        "activites": [
          {
            "type": "projet",
            "texte": "Atelier projet / maquette (avancement)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Rencontre métier",
        "activites": [
          {
            "type": "rencontres",
            "texte": "Échanges avec un mécanicien avion sur la maintenance."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2026-02-04",
    "date": "Mercredi 4 février 2026",
    "statut": "session",
    "note": "Séances de reprise après les vacances d’hiver.",
    "messageOff": "",
    "activitesCommunes": [
      {
        "groupes": [
          "EAJ2",
          "EAJ3"
        ],
        "horaire": "15h00 – 16h30",
        "lieu": "Salle de sport ou extérieur",
        "encadrant": "Équipe EAJ",
        "tag": "Cohésion inter-groupes",
        "activites": [
          {
            "type": "sport",
            "texte": "Tournoi multi-activités entre EAJ2 et EAJ3."
          }
        ]
      }
    ],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA",
        "activites": [
          {
            "type": "bia",
            "texte": "Séance de cours BIA (thème à préciser)."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Sport & cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Échauffement + jeux de relais avant activité commune.",
            "horaire": "14h30 – 15h00"
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Sport / cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Séance de sport / cohésion (jeu collectif)."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2026-02-11",
    "date": "Mercredi 11 février 2026",
    "statut": "off",
    "note": "Semaine sans séance EAJ (vacances scolaires / contraintes base).",
    "messageOff": "Pas de séance EAJ cette semaine. Reprise lors de la prochaine date indiquée.",
    "activitesCommunes": [],
    "groupes": []
  },
  {
    "isoDate": "2026-02-18",
    "date": "Mercredi 18 février 2026",
    "statut": "session",
    "note": "Séance hebdomadaire.",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "horaire": "14h30 – 17h00",
        "lieu": "Salle de cours BIA",
        "tenue": "Tenue civile correcte",
        "materiel": "Cahier, stylo",
        "encadrant": "Sgt Dupont",
        "tag": "BIA",
        "activites": [
          {
            "type": "bia",
            "texte": "Séance de cours BIA (thème à préciser)."
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "horaire": "14h30 – 17h00",
        "lieu": "Atelier technique",
        "tenue": "Tenue décontractée, chaussures fermées",
        "materiel": "Gourde",
        "encadrant": "Adjt Martin",
        "tag": "Projet",
        "activites": [
          {
            "type": "projet",
            "texte": "Atelier projet / maquette (avancement)."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "horaire": "14h30 – 17h00",
        "lieu": "Terrain de sport / extérieur",
        "tenue": "Tenue de sport",
        "materiel": "Gourde, k-way selon météo",
        "encadrant": "CNE Durand",
        "tag": "Sport / cohésion",
        "activites": [
          {
            "type": "sport",
            "texte": "Séance de sport / cohésion (jeu collectif)."
          }
        ]
      }
    ]
  }
];
