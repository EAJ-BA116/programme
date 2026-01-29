// ⚠️ Bannières d’alerte (multi-cibles : all / EAJ1 / EAJ2 / EAJ3)
const ALERT_BANNERS = [
  {
    "actif": true,
    "emoji": "⚠️",
    "type": "attention",
    "texte": "N'oubliez pas de vous inscrire au BIA auprès de vos établissements scolaires. Les inscriptions ont lieu du 28 janvier au 11 mars 2026.",
    "cibles": ["all"],
    "startDate": "25/01/2026",
    "endDate": "11/03/2026"
  },
  {
    "actif": true,
    "emoji": "📢",
    "type": "annonce",
    "texte": "Message programmé : à partir du 15 mars 2026, une nouvelle annonce peut s'afficher ici.",
    "cibles": ["all"],
    "startDate": "15/03/2026"
  }

];

// ⚠️ Compat (ancien format) : concaténation des bannières
const ALERT_BANNER = {
  "actif": false,
  "texte": "⚠️ N'oubliez pas de vous inscrire au BIA auprès de vos établissements scolaires. Les inscriptions ont lieu du 28 janvier au 11 mars 2026."
};

// 📝 Dernière mise à jour (affichée dans le footer)
const LAST_UPDATE = {
  "auteur": "Yoann",
  "dateTexte": "25/01/2026"
};

// 🗓️ LISTE DES SEMAINES / ÉVÉNEMENTS (isoDate au format AAAA-MM-JJ)
const SEMAINES = [
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
        "tenue": "Tenue de Vol + Parka"
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
        "tenue": "Tenue de Vol + Parka"
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
        "tenue": "Tenue de Vol + Parka",
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
  },
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
            "texte": "Aérodynamique",
            "horaire": "14h - 15 h",
            "materiel": "Manuel BIA, trousse"
          },
          {
            "type": "drone",
            "texte": "Réglementation",
            "horaire": "15h -15h30"
          }
        ],
        "tenue": "Tenue de vol",
        "encadrant": "ADJ Yoann"
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
            "horaire": "14h-16h",
            "lieu": "Cristal",
            "tenue": "Tenue de Vol",
            "encadrant": "ADJ Grany"
          },
          {
            "type": "rencontres",
            "texte": "Galette des Rois",
            "horaire": "16h-17h",
            "lieu": "UIS",
            "encadrant": "Ensemble des encadrants"
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
            "texte": "Aérodynamique",
            "horaire": "14h-16h",
            "materiel": "Manuel BIA, trousse",
            "encadrant": "CNE Gigi"
          },
          {
            "type": "rencontres",
            "texte": "Galettes des Rois",
            "horaire": "16h-17h",
            "lieu": "UIS",
            "encadrant": "Ensemble des encadrants"
          }
        ],
        "tenue": "Tenue de Vol"
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": [],
        "horaire": "14h00-17h00",
        "lieu": "Cristal",
        "tenue": "Tenue de Vol",
        "encadrant": "ADJ Grany"
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": [],
        "horaire": "14h00-17h00",
        "lieu": "Cristal",
        "tenue": "Tenue de Vol",
        "encadrant": "ADJ Grany"
      }
    ]
  },
  {
    "isoDate": "2026-01-21",
    "date": "21 janvier 2026",
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
            "texte": "Aérodynamique",
            "lieu": "Salle de Cours",
            "tenue": "Tenue de Vol",
            "materiel": "Manuel BIA, Trousse",
            "encadrant": "CNE Gigi"
          }
        ]
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": [
          {
            "type": "ceremonie",
            "texte": "Voeux du prefet",
            "horaire": "16h30",
            "lieu": "Devant le base",
            "tenue": "Tenue de Vol",
            "encadrant": "Major Laurent, SGC Maxime"
          }
        ],
        "tag": "Pour les 4 personnes désignées"
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": [
          {
            "type": "projet",
            "texte": "80 ans Tony Papin",
            "lieu": "T19",
            "tenue": "Tenue de Vol",
            "encadrant": "ADC Anthony, ADJ Yoann, ADJ Henri, ADC Will, ADJ Laurent"
          }
        ],
        "tag": "Maquette + Texte 80 ans Tony Papin"
      }
    ]
  },
  {
    "isoDate": "2026-01-28",
    "date": "28 janvier 2026",
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
            "texte": "Aérodynamique : Aérospatial",
            "encadrant": "CNE Gigi"
          }
        ],
        "horaire": "14h-17h",
        "lieu": "T19",
        "tag": "BIA + Révision module Aérodynamique"
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": [
          {
            "type": "projet",
            "texte": "Projet Tomy Papin",
            "encadrant": "ADC Anthony, ADJ Yoann, ADJ Henri"
          }
        ],
        "horaire": "14h-17h",
        "lieu": "T19",
        "tag": "Maquette, texte"
      }
    ]
  },
  {
    "isoDate": "2026-02-04",
    "date": "4 février 2026",
    "statut": "session",
    "note": "Attention, il faudra surement arriver avant l'heure prévu.",
    "messageOff": "",
    "activitesCommunes": [
      {
        "groupes": [
          "EAJ1",
          "EAJ3"
        ],
        "activites": [
          {
            "type": "ceremonie",
            "texte": "Cérémonie des 80 ans de Tomy Papin, parrain de la BA 116"
          }
        ],
        "horaire": "14h - 16h",
        "lieu": "BA 116",
        "tenue": "Tenue de vol"
      }
    ],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "activites": []
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": []
      }
    ]
  },
  {
    "isoDate": "2026-02-10",
    "date": "10 février 2026",
    "statut": "off",
    "note": "",
    "messageOff": "Vacances de février",
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
    "isoDate": "2026-02-18",
    "date": "18 février 2026",
    "statut": "off",
    "note": "",
    "messageOff": "Vacances de février",
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
    "isoDate": "2026-02-25",
    "date": "25 février 2026",
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
            "texte": "Météo",
            "horaire": "14h - 15h30",
            "materiel": "Manuel BIA, Trousse",
            "encadrant": "CNE Gigi"
          },
          {
            "type": "aeromodelisme",
            "texte": "Maquette",
            "horaire": "15h30-17h",
            "lieu": "T19",
            "encadrant": "ADC Alex"
          }
        ],
        "horaire": "14h - 17h",
        "tenue": "Tenue de vol"
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": [
          {
            "type": "aeromodelisme",
            "texte": "Maquette",
            "horaire": "14h - 15h30",
            "lieu": "T19",
            "tenue": "Tenue de vol",
            "encadrant": "ADC Alex"
          },
          {
            "type": "visite",
            "texte": "SEO(essence) ou Pompier de l'air",
            "horaire": "15h30 - 17h"
          }
        ],
        "horaire": "14h - 17h",
        "tenue": "Tenue de vol"
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": [
          {
            "type": "projet",
            "texte": "Henri Fertet Prix Armée Jeunesse",
            "materiel": "Trousse",
            "encadrant": "ADC Anthony, ADJ Yoann, ADJ Henri"
          }
        ],
        "horaire": "14h00 - 17h",
        "tenue": "Tenue de vol"
      }
    ]
  },
  {
    "isoDate": "2026-03-04",
    "date": "4 mars 2026",
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
            "texte": "Météo",
            "encadrant": "SLT Daniel"
          }
        ],
        "horaire": "14h - 16h",
        "tenue": "Tenue de Vol",
        "materiel": "Manuel BIA, Trousse"
      }
    ]
  },
  {
    "isoDate": "2026-03-11",
    "date": "11 mars 2026",
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
            "type": "sport",
            "texte": "Challenge EAJ2 - EAJ3"
          }
        ],
        "horaire": "14h - 17h",
        "lieu": "Gymnase",
        "tenue": "Tenue de sport",
        "materiel": "Gourde",
        "encadrant": "Moniteurs de sports"
      }
    ],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "activites": [
          {
            "type": "bia",
            "texte": "Météo",
            "horaire": "14h00 15h30",
            "tenue": "Tenue de Vol",
            "materiel": "Manuel BIA, trousse",
            "encadrant": "CNE Gigi"
          },
          {
            "type": "sport",
            "texte": "Scéance de sport",
            "horaire": "5h30 - 17h",
            "lieu": "Gymanse",
            "tenue": "Tenue de sport",
            "materiel": "Gourde",
            "encadrant": "Moniteurs de sports"
          }
        ],
        "tenue": "Tenue de vol, Tenue de sport",
        "materiel": "Manuel Bia, Trousse, Gourde"
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": [],
        "tenue": "Tenue de sport",
        "materiel": "Gourde"
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": [],
        "tenue": "Tenue de sport",
        "materiel": "Gourde"
      }
    ]
  },
  {
    "isoDate": "2026-03-18",
    "date": "18 mars 2026",
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
            "texte": "Météo",
            "horaire": "14h - 16h",
            "encadrant": "CNE Gigi"
          },
          {
            "type": "drone",
            "texte": "Réglementation",
            "horaire": "16h - 17h",
            "materiel": "Trousse",
            "encadrant": "ADJ Yoann, ADC William"
          }
        ],
        "horaire": "14h - 17h",
        "tenue": "Tenue de Vol",
        "materiel": "Manuel BIA, Trousse"
      }
    ]
  },
  {
    "isoDate": "2026-03-25",
    "date": "25 mars 2026",
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
            "texte": "Météo",
            "horaire": "14h - 15h30",
            "materiel": "Manuel BIA, Trousse"
          },
          {
            "type": "aeromodelisme",
            "texte": "Maquette",
            "horaire": "15h30 - 17h",
            "lieu": "T19",
            "encadrant": "ADC Alex"
          }
        ],
        "horaire": "14h - 17h",
        "tenue": "Tenue de vol"
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": [
          {
            "type": "aeromodelisme",
            "texte": "Maquette",
            "horaire": "14h - 15h30",
            "encadrant": "ADC Alex"
          },
          {
            "type": "visite",
            "texte": "SEO ou pompier",
            "horaire": "15h30 - 17h"
          }
        ],
        "horaire": "14h - 17h",
        "tenue": "Tenue de vol"
      }
    ]
  },
  {
    "isoDate": "2026-04-01",
    "date": "1 avril 2026",
    "statut": "off",
    "note": "",
    "messageOff": "BASEX. Peut-être cours  BIA en Visio conférence pour les EAJ 1",
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
    "isoDate": "2026-04-08",
    "date": "8 avril 2026",
    "statut": "off",
    "note": "",
    "messageOff": "Vacances de Pâques",
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
    "isoDate": "2026-04-15",
    "date": "15 avril 2026",
    "statut": "off",
    "note": "",
    "messageOff": "Vacances de Pâques",
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
    "isoDate": "2026-04-22",
    "date": "22 avril 2026",
    "statut": "session",
    "note": "",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "activites": [
          {
            "type": "rencontres",
            "texte": "Présentation métier du BIA",
            "horaire": "14h- 15h30",
            "lieu": "HM10",
            "tenue": "Tenue de vol",
            "encadrant": "Encadrant EAJ"
          },
          {
            "type": "bia",
            "texte": "Circulation aérienne",
            "horaire": "15h30 - 17h",
            "tenue": "Tenue de vol",
            "materiel": "Manuel BIA, Trousse",
            "encadrant": "CNE Gigi"
          }
        ],
        "horaire": "14h - 17h"
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": [
          {
            "type": "tir",
            "texte": "Tir à la Carabine",
            "horaire": "14h - 17h",
            "tenue": "Tenue de vol",
            "encadrant": "ADC Franck, ADC Philippe"
          }
        ],
        "horaire": "14h - 17h"
      }
    ]
  },
  {
    "isoDate": "2026-04-29",
    "date": "29 avril 2026",
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
            "texte": "Circulation aérienne",
            "horaire": "14h - 16h",
            "materiel": "Trousse, Gourde",
            "encadrant": "CNE Gigi"
          }
        ],
        "horaire": "14h - 16h"
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": [
          {
            "type": "drone",
            "texte": "Drone",
            "horaire": "14h - 17h",
            "tenue": "Tenue de Vol",
            "encadrant": "ADC William, ADJ Yoann"
          }
        ],
        "horaire": "14h - 17h"
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": [
          {
            "type": "rencontres",
            "texte": "Stand EAJ pour les classes de défense",
            "horaire": "14h - 17h",
            "lieu": "HM10",
            "tenue": "Tenue de Vol",
            "encadrant": "ADJ Henri"
          }
        ],
        "horaire": "14h - 17h",
        "tag": "3 - 4 EAJ nécessaire pour présenter les EAJ"
      }
    ]
  },
  {
    "isoDate": "2026-05-06",
    "date": "6 mai 2026",
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
            "texte": "Circulation aérienne",
            "horaire": "14h 15h30",
            "materiel": "Trousse, manuel BIA",
            "encadrant": "CNE Gigi"
          },
          {
            "type": "rencontres",
            "texte": "CIRFA de Besançon",
            "horaire": "15h30 - 17h",
            "encadrant": "Personnel du CIRFA"
          }
        ],
        "horaire": "14h - 17h",
        "tenue": "Tenue de vol"
      }
    ]
  },
  {
    "isoDate": "2026-05-13",
    "date": "13 mai 2026",
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
            "texte": "Circulation aérienne",
            "horaire": "14h - 16h",
            "materiel": "Trousse, Manuel BIA",
            "encadrant": "CNE Gigi"
          }
        ],
        "horaire": "14h - 16h",
        "tenue": "Tenue de Vol",
        "tag": "Dernière séance de BIA avant examen"
      }
    ]
  },
  {
    "isoDate": "2026-05-14",
    "date": "14 mai 2026",
    "statut": "session",
    "note": "Challenge Inter EAJ sur la BA de Salon. Nous prenons seulement 6 équipiers des EAJ2 et 3 pour y aller. Les EAJ 1 passent leur examen du BIA le 20/05/2026",
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
            "type": "rencontres",
            "texte": "Challenge Inter EAJ"
          }
        ],
        "horaire": "du jeudi 14/05/2026 au dimanche 17/05/2026",
        "encadrant": "ADC Franck"
      }
    ],
    "groupes": [
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": [
          {
            "type": "rencontres",
            "texte": "Sport, drone..."
          }
        ]
      },
      {
        "titre": "Groupe 3 – EAJ3",
        "activites": [
          {
            "type": "rencontres",
            "texte": "Sport, drone..."
          }
        ]
      }
    ]
  },
  {
    "isoDate": "2026-05-20",
    "date": "20 mai 2026",
    "statut": "session",
    "note": "",
    "messageOff": "",
    "activitesCommunes": [],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "activites": [
          {
            "type": "autre",
            "texte": "Examen BIA"
          }
        ],
        "horaire": "14h - 17h",
        "lieu": "Lycée Lumiére",
        "tenue": "Tenue de Vol",
        "tag": "Examen final BIA. Bon Courage"
      },
      {
        "titre": "Groupe 2 – EAJ2",
        "activites": [
          {
            "type": "visite",
            "texte": "Cimetière Epinal ou  Musée de Vincey",
            "horaire": "14h - 17h",
            "lieu": "Epinal ou Vincey",
            "encadrant": "ADC Anthony"
          }
        ],
        "horaire": "14h - 17h",
        "tenue": "Tenue de Vol"
      }
    ]
  },
  {
    "isoDate": "2026-05-27",
    "date": "27 mai 2026",
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
            "type": "rencontres",
            "texte": "Challenge Cérébral (😂) entre les EAJ 2 et 3",
            "horaire": "14h- 17h",
            "lieu": "BA 116",
            "tenue": "Tenue de sport",
            "materiel": "Gourde"
          }
        ],
        "lieu": "BA 116"
      }
    ],
    "groupes": [
      {
        "titre": "Groupe 1 – EAJ1",
        "activites": [
          {
            "type": "sport",
            "texte": "Sport Armée Jeunesse",
            "horaire": "14h - 17h",
            "lieu": "Gymnase",
            "encadrant": "Moniteurs de sports"
          }
        ],
        "tenue": "Tenue de sport",
        "materiel": "Gourde",
        "tag": "Rencontre sportive avec les cadets de la gendarmerie, les pompiers...."
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
