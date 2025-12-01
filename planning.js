// ⚠️ Bannière d’alerte globale
const ALERT_BANNER = {
  "actif": true,
  "texte": "Pour les retardataires : merci de nous transmettre au plus vite le chèque de caution de 150 € ainsi que la cotisation CSA de 50 € (réglable via le Pass’Sport CAF), impérativement dans les 15 prochains jours"
};

// 📝 Dernière mise à jour (affichée dans le footer)
const LAST_UPDATE = {
  "auteur": "Yoann",
  "dateTexte": "01/12/2025"
};

// 🗓️ LISTE DES SEMAINES / ÉVÉNEMENTS (isoDate au format AAAA-MM-JJ)
const SEMAINES = [
  {
    "isoDate": "2026-01-07",
    "date": "7 janvier 2026",
    "statut": "session",
    "note": "",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "activites": [
          {
            "type": "bia",
            "texte": "Moteur",
            "horaire": "14h - 15h30",
            "materiel": "Manuel BIA, trousse"
          }
        ],
        "tenue": "Tenue de vol"
      }
    ]
  },
  {
    "isoDate": "2026-01-14",
    "date": "14 janvier 2026",
    "statut": "session",
    "note": "",
    "messageOff": "",
    "activitesCommunes": [
      {
        "groupes": [
          "EAJ2",
          "EAJ3"
        ],
        "activites": [
          {
            "type": "devoirMemoire",
            "texte": "Présentation patchs, traditions",
            "horaire": "14h-17h",
            "encadrant": "ADJ Grany"
          }
        ],
        "tenue": "Tenue de vol"
      }
    ],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "activites": [
          {
            "type": "bia",
            "texte": "Conduite de Vol",
            "horaire": "14h-15h30",
            "materiel": "Manuel BIA, trousse"
          },
          {
            "type": "drone",
            "texte": "Réglementation",
            "horaire": "15h30-17h00",
            "tenue": "Manuel BIA, trousse",
            "encadrant": "ADJ Yoann"
          }
        ],
        "tenue": "Tenue de Vol"
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": []
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": []
      }
    ]
  },
  {
    "isoDate": "2025-12-03",
    "date": "3 décembre 2025",
    "statut": "session",
    "note": "",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "activites": [
          {
            "type": "bia",
            "texte": "Aéronefs et engins spéciaux",
            "horaire": "14h00 à 15h30",
            "materiel": "Manuel BIA, trousse",
            "encadrant": "CNE Gigi"
          },
            {
            "type": "aeromodelisme",
            "texte": "Aéromodélisme",
            "horaire": "15h30 à 17h00",
            "lieu": "T19",
            "encadrant": "ADC Alexandre"
          },
          {
            "type": "rencontres",
            "texte": "Visite des EAJ de Dijon",
            "horaire": "Dans l'après-midi (10minutes)"
          }
        ],
        "tenue": "Tenue de Vol"
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": [
          {
            "type": "aeromodelisme",
            "texte": "Aéromodélisme",
            "horaire": "14h00 à 15h30",
            "lieu": "T19",
            "encadrant": "ADC Alexandre"
          },
          {
            "type": "rencontres",
            "texte": "Visite des EAJ de Dijon",
            "horaire": "Dans l'après-midi (10minutes)"
          },
          {
            "type": "tir",
            "texte": "carabine",
            "horaire": "15h30-17h00",
            "lieu": "Escadron de protection",
            "encadrant": "Personnel de l'EP"
          }
        ],
        "tenue": "Tenue de Vol"
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": [
          {
            "type": "projet",
            "texte": "Prix Armée Jeunesse/Tony Papin",
            "horaire": "14h00 à 16h00",
            "lieu": "Salle de cours",
            "materiel": "Trousse",
            "encadrant": "ADC Anthony"
          }
        ],
        "horaire": "14h-16h",
        "tenue": "Tenue de Vol",
        "materiel": "Chéque CSA (50€) + caution (150€)"
      }
    ]
  },
  {
    "isoDate": "2025-12-10",
    "date": "10 décembre 2025",
    "statut": "session",
    "note": "",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "activites": [
          {
            "type": "bia",
            "texte": "Etude des aéronefs et engins spatiaux",
            "horaire": "14h00 à 16h30",
            "materiel": "Manuel BIA, trousse",
            "encadrant": "CNE Gigi"
          },
          {
            "type": "autre",
            "texte": "Essayage des calots",
            "horaire": "16h30 à 17h00",
            "encadrant": "Equipe EAJ"
          }
        ],
        "tenue": "Tenue de vol"
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": [
          {
            "type": "rencontres",
            "texte": "Breifing Maj",
            "encadrant": "Maj Laurent"
          },
          {
            "type": "autre",
            "texte": "Informations FMIR",
            "encadrant": "ADC Franck"
          },
          {
            "type": "projet",
            "texte": "80 ans Tony Papin",
            "horaire": "14h-17h",
            "tenue": "Trousse",
            "encadrant": "ADC Anthony, ADJ Yoann, ADJ Henri, Adj Laurent, Adj, Will"
          }
        ],
        "tenue": "Tenue de vol"
      }
    ]
  },
  {
    "isoDate": "2025-12-17",
    "date": "17 décembre 2025",
    "statut": "session",
    "note": "",
    "messageOff": "",
    "activitesCommunes": [
      {
        "groupes": [
          "EAJ1",
          "EAJ2",
          "EAJ3"
        ],
        "activites": [
          {
            "type": "ceremonie",
            "texte": "Répétition cérémonie",
            "horaire": "15h30-17h00",
            "encadrant": "Equipe EAJ"
          },
          {
            "type": "ceremonie",
            "texte": "Cérémonie Calot+ remise éperviers, avec  les parents des nouveaux EAJ 2025",
            "horaire": "17h-18h30",
            "encadrant": "Equipe EAJ"
          }
        ],
        "horaire": "15h30-17h00",
        "lieu": "Mess",
        "tenue": "Tenue de vol",
        "encadrant": "Equipe EAJ"
      }
    ],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "activites": [
          {
            "type": "visite",
            "texte": "Musée LUXEUIL",
            "horaire": "14h00 à 15h30",
            "lieu": "Musée en ville",
            "tenue": "Tenue civile",
            "encadrant": "ADC Anthony"
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": []
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": []
      }
    ]
  },
  {
    "isoDate": "2025-12-24",
    "date": "24 décembre 2025",
    "statut": "off",
    "note": "",
    "messageOff": "Vacances scolaires et joyeux Noël",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "activites": []
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": []
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": []
      }
    ]
  },
  {
    "isoDate": "2025-12-31",
    "date": "31 décembre 2025",
    "statut": "off",
    "note": "",
    "messageOff": "Vacances scolaires et Bonne année",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "activites": []
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": []
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": []
      }
    ]
  }
];
