// 🎨 TYPES D’ACTIVITÉS : couleur + emoji (uniquement côté site public)
const TYPES_ACTIVITE = {
  bia:            { label: "Cours BIA",         emoji: "📘", color: "#1d4ed8" },
  sport:          { label: "Sport",             emoji: "🏃‍♂️", color: "#f97316" },
  visite:         { label: "Visite",            emoji: "🏛️", color: "#a855f7" },
  projet:         { label: "Projet",            emoji: "🛠️",  color: "#22c55e" },
  aeromodelisme:  { label: "Aéromodélisme",     emoji: "✈️",  color: "#0ea5e9" },
  drone:          { label: "Drone",             emoji: "🛸",  color: "#6366f1" },
  tir:            { label: "Tir",               emoji: "🎯",  color: "#ef4444" },
  rencontres:     { label: "Rencontres",        emoji: "🤝",  color: "#eab308" },
  devoirMemoire:  { label: "Devoir de mémoire", emoji: "🕯️", color: "#facc15" },
  ceremonie:      { label: "Cérémonie",         emoji: "🎖️", color: "#e3312d" },
  autre:          { label: "Autres",            emoji: "✨",  color: "#64748b" }
};

/* ---------- Petits helpers HTML ---------- */

/**
 * Affiche un bloc label + valeur seulement si la valeur est non vide.
 * Retourne une string HTML (ou "" si vide).
 */
function buildInfoBlock(label, value) {
  if (!value) return "";
  return `
    <p class="label">${label}</p>
    <p class="value">${value}</p>
  `;
}

/**
 * Construit la ligne de tags à partir d’un encadrant + tag.
 * N’affiche rien si tout est vide.
 */
function buildTagLine(encadrant, tag) {
  const tags = [];
  if (encadrant) {
    tags.push(`<span class="tag">Encadrant : ${encadrant}</span>`);
  }
  if (tag) {
    tags.push(`<span class="tag">${tag}</span>`);
  }

  if (!tags.length) return "";
  return `<div class="tag-line">${tags.join("")}</div>`;
}

/* ---------- Pastille d’activité ---------- */

function createActivityChip(activity, groupDefaults = {}) {
  const typeCfg = TYPES_ACTIVITE[activity.type] || {
    label: "Autre",
    emoji: "✨",
    color: "#64748b"
  };

  const chip = document.createElement("div");
  chip.className = "activity-chip";

  // 🎨 fond teinté selon l’activité
  const baseColor = typeCfg.color;
  const bgColor = baseColor.length === 7 ? baseColor + "25" : baseColor;
  chip.style.background = bgColor;
  chip.style.borderLeft = `4px solid ${baseColor}`;

  const textSpan = document.createElement("span");

  let html = `${typeCfg.emoji} <strong>${typeCfg.label}</strong> – ${activity.texte}`;

  // 🔎 Infos spécifiques d’activité, avec fallback sur le groupe
  const extras = [];
  const horaire  = activity.horaire  || groupDefaults.horaire  || "";
  const lieu     = activity.lieu     || groupDefaults.lieu     || "";
  const tenue    = activity.tenue    || groupDefaults.tenue    || "";
  const materiel = activity.materiel || groupDefaults.materiel || "";
  const encadrant= activity.encadrant|| groupDefaults.encadrant|| "";

  if (horaire)  extras.push(`⏰ ${horaire}`);
  if (lieu)     extras.push(`📍 ${lieu}`);
  if (tenue)    extras.push(`👕 ${tenue}`);
  if (materiel) extras.push(`🎒 ${materiel}`);
  if (encadrant)extras.push(`👤 ${encadrant}`);

  if (extras.length > 0) {
    html += `<br><small>${extras.join(" • ")}</small>`;
  }

  textSpan.innerHTML = html;
  chip.appendChild(textSpan);

  return chip;
}

/* ---------- Prochaine séance ---------- */

// 🔎 Trouver l'indice de la prochaine séance (statut "session" avec date >= aujourd'hui)
function trouverIndiceProchaineSession() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let bestIndex = -1;
  let bestTime = Infinity;

  SEMAINES.forEach((sem, idx) => {
    if (sem.statut !== "session" || !sem.isoDate) return;
    const d = new Date(sem.isoDate);
    if (isNaN(d)) return;

    if (d >= today && d.getTime() < bestTime) {
      bestTime = d.getTime();
      bestIndex = idx;
    }
  });

  return bestIndex;
}

/* ---------- Rendu d’une semaine ---------- */

function renderSemaine(p, index, indexProchaine, estPassee) {
  const section = document.createElement("section");
  section.className = "week";

  if (estPassee) {
    section.classList.add("week-past");
  }
  if (index === indexProchaine && !estPassee && p.statut === "session") {
    section.classList.add("week-next");
  }

  let label = "";
  if (index === indexProchaine && !estPassee && p.statut === "session") {
    label = '<span class="week-label">Prochaine séance</span>';
  } else if (estPassee) {
    label = '<span class="week-label-past">Séance passée</span>';
  }

  const header = document.createElement("div");
  header.className = "week-header";
  header.innerHTML = `
    <div>
      <div class="week-title">${p.date}</div>
      <div class="week-note">${p.note || ""}</div>
    </div>
    ${label}
  `;
  section.appendChild(header);

  // 🛑 Semaine OFF
  if (p.statut === "off") {
    const offDiv = document.createElement("div");
    offDiv.className = "week-off";
    offDiv.innerHTML = `
      <div class="week-off-emoji">🛑</div>
      <div class="week-off-title">Pas de séance EAJ</div>
      <p class="week-off-text">
        ${p.messageOff || "Les activités reprendront la semaine suivante."}
      </p>
    `;
    section.appendChild(offDiv);
    return section;
  }

  // 🤝 Activités communes plein écran
  if (Array.isArray(p.activitesCommunes) && p.activitesCommunes.length > 0) {
    p.activitesCommunes.forEach(entry => {
      if (!entry) return;

      const card = document.createElement("article");
      card.className = "group-card week-common-card";

      const groupes = Array.isArray(entry.groupes) ? entry.groupes : [];
      card.dataset.groups = groupes.join(",");

      const groupesLabel = groupes.length
        ? "Groupes concernés : " + groupes.join(" + ")
        : "Tous les groupes";

      card.innerHTML = `
        <div class="week-common-emoji">🤝</div>
        <div class="week-common-title">Activité commune</div>
        <div class="week-common-groups">${groupesLabel}</div>

        <p class="label">Activités :</p>
        <div class="activities-list"></div>

        ${buildInfoBlock("Horaire :", entry.horaire || "")}
        ${buildInfoBlock("Lieu :", entry.lieu || "")}
        ${buildInfoBlock("Tenue :", entry.tenue || "")}
        ${buildInfoBlock("Matériel à apporter :", entry.materiel || "")}

        ${buildTagLine(entry.encadrant || "", entry.tag || "Activité commune")}
      `;

      const activitiesList = card.querySelector(".activities-list");
      (entry.activites || []).forEach(a => {
        if (!a) return;
        activitiesList.appendChild(createActivityChip(a, entry));
      });

      section.appendChild(card);
    });
  }

  // 👥 Groupes EAJ1 / EAJ2 / EAJ3
  const groupsContainer = document.createElement("div");
  groupsContainer.className = "groups";

  const presentGroups = new Set();

  (p.groupes || []).forEach(g => {
    // sécurité : si g ou son titre est absent, on saute
    if (!g || typeof g.titre !== "string") {
      return;
    }

    const article = document.createElement("article");
    article.className = "group-card";

    const titre = g.titre || "";
    const groupId =
      titre.includes("EAJ1") ? "EAJ1" :
      titre.includes("EAJ2") ? "EAJ2" :
      titre.includes("EAJ3") ? "EAJ3" : "";

    if (groupId) {
      presentGroups.add(groupId);
    }

    article.dataset.group = groupId;

    article.innerHTML = `
      <div class="group-title">${titre}</div>

      <p class="label">Activités :</p>
      <div class="activities-list"></div>

      ${buildInfoBlock("Horaire (général) :", g.horaire || "")}
      ${buildInfoBlock("Lieu (général) :", g.lieu || "")}
      ${buildInfoBlock("Tenue (générale) :", g.tenue || "")}
      ${buildInfoBlock("Matériel à apporter (général) :", g.materiel || "")}

      ${buildTagLine(g.encadrant || "", g.tag || "")}
    `;

    const activitiesList = article.querySelector(".activities-list");
    (g.activites || []).forEach(a => {
      if (!a) return;
      activitiesList.appendChild(createActivityChip(a, g));
    });

    groupsContainer.appendChild(article);
  });

  // 🛑 Groupes absents : tuile “Pas de séance EAJx”
  const ALL_GROUPS = [
    { id: "EAJ1", titre: "Groupe 1 – EAJ1" },
    { id: "EAJ2", titre: "Groupe 2 – EAJ2" },
    { id: "EAJ3", titre: "Groupe 3 – EAJ3" }
  ];

  ALL_GROUPS.forEach(gMeta => {
    if (!presentGroups.has(gMeta.id)) {
      const article = document.createElement("article");
      article.className = "group-card group-card-off";
      article.dataset.group = gMeta.id;

      article.innerHTML = `
        <div class="group-title">${gMeta.titre}</div>
        <div class="group-off">
          <div class="group-off-emoji">🛑</div>
          <div class="group-off-title">Pas de séance ${gMeta.id}</div>
          <p class="group-off-text">
            Ce groupe n'est pas convoqué pour cette date.
          </p>
        </div>
      `;

      groupsContainer.appendChild(article);
    }
  });

  section.appendChild(groupsContainer);
  return section;
}


/* ---------- Rendu de toutes les semaines ---------- */

function renderToutesLesSemaines() {
  const container = document.getElementById("week-container");
  if (!container) return;

  container.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const indexProchaine = trouverIndiceProchaineSession();

  const futures = [];
  const past = [];

  SEMAINES.forEach((sem, idx) => {
    const d = new Date(sem.isoDate);
    if (isNaN(d)) return;
    const estPassee = d < today;
    (estPassee ? past : futures).push({ sem, idx, date: d });
  });

  futures.sort((a, b) => a.date - b.date); // du plus proche au plus loin
  past.sort((a, b) => b.date - a.date);    // de la + récente à la + ancienne

  const ordered = [];

  // D’abord la prochaine séance, si future
  if (indexProchaine !== -1) {
    const i = futures.findIndex(x => x.idx === indexProchaine);
    if (i !== -1) {
      const nextItem = futures.splice(i, 1)[0];
      ordered.push(nextItem);
    }
  }

  // Puis le reste
  ordered.push(...futures);
  ordered.push(...past);

  ordered.forEach(item => {
    const estPassee = item.date < today;
    const section = renderSemaine(item.sem, item.idx, indexProchaine, estPassee);
    container.appendChild(section);
  });
}

/* ---------- Filtre EAJ1 / EAJ2 / EAJ3 ---------- */

function appliquerFiltre(nomGroupe) {
  const cartes = document.querySelectorAll(".group-card");

  cartes.forEach(carte => {
    const isCommon = carte.classList.contains("week-common-card");

    // Cas "Tous"
    if (nomGroupe === "all") {
      carte.style.display = "";
      return;
    }

    // Cas activités communes
    if (isCommon) {
      const groupsAttr = carte.dataset.groups || "";
      if (!groupsAttr) {
        carte.style.display = ""; // si pas précisé, on affiche pour tous
        return;
      }
      const list = groupsAttr
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

      carte.style.display = list.includes(nomGroupe) ? "" : "none";
      return;
    }

    // Cas carte de groupe
    const groupe = carte.dataset.group; // "EAJ1" / "EAJ2" / "EAJ3"
    carte.style.display = (groupe === nomGroupe) ? "" : "none";
  });
}

function initialiserFiltres() {
  const boutons = document.querySelectorAll(".btn-filter");
  if (!boutons.length) return;

  const FILTERS_VALIDES = ["all", "EAJ1", "EAJ2", "EAJ3"];
  let filtreActuel = "all";

  // 🔄 Lecture depuis localStorage
  try {
    const stored = localStorage.getItem("eaj_filter");
    if (stored && FILTERS_VALIDES.includes(stored)) {
      filtreActuel = stored;
    }
  } catch (e) {}

  // Appliquer au démarrage
  appliquerFiltre(filtreActuel);

  // Etat visuel
  boutons.forEach(btn => {
    const val = btn.dataset.filter;
    if (val === filtreActuel) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Clics
  boutons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter || "all";

      boutons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      appliquerFiltre(filter);

      try {
        localStorage.setItem("eaj_filter", filter);
      } catch (e) {}
    });
  });
}

/* ---------- Thème sombre / clair ---------- */

function initialiserThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const body = document.body;

  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem("eaj_theme");
  } catch (e) {}

  if (storedTheme === "light" || storedTheme === "dark") {
    body.dataset.theme = storedTheme;
  }

  const isDark = body.dataset.theme === "dark";
  btn.textContent = isDark ? "☀️ Mode clair" : "🌙 Mode sombre";

  btn.addEventListener("click", () => {
    const isDarkNow = body.dataset.theme === "dark";
    const newTheme = isDarkNow ? "light" : "dark";

    body.dataset.theme = newTheme;
    btn.textContent = newTheme === "dark" ? "☀️ Mode clair" : "🌙 Mode sombre";

    try {
      localStorage.setItem("eaj_theme", newTheme);
    } catch (e) {}
  });
}

/* ---------- Dernière mise à jour & bannière ---------- */

function renderLastUpdate() {
  const el = document.getElementById("last-update");
  if (!el || typeof LAST_UPDATE === "undefined") return;
  el.textContent = `Programme mis à jour par ${LAST_UPDATE.auteur} le ${LAST_UPDATE.dateTexte}`;
}

function renderAlert() {
  const banner = document.getElementById("alert-banner");
  if (!banner || typeof ALERT_BANNER === "undefined") return;
  if (!ALERT_BANNER || !ALERT_BANNER.actif) return;
  banner.textContent = ALERT_BANNER.texte;
  banner.style.display = "block";
}

/* ---------- Bouton retour haut (patch ✈️) ---------- */

function initialiserBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  function toggleVisibility() {
    if (window.scrollY > 150) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }
  }

  window.addEventListener("scroll", toggleVisibility);

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  toggleVisibility();
}

/* ---------- Modal accès administrateur ---------- */

function initialiserAdminModal() {
  const ADMIN_CODE = "EAJ116"; // 🔐 change le code ici si besoin

  const link = document.getElementById("admin-link");
  const modal = document.getElementById("admin-modal");
  if (!link || !modal) return;

  const backdrop = modal.querySelector(".admin-modal-backdrop");
  const input = document.getElementById("admin-code-input");
  const btnCancel = document.getElementById("admin-cancel");
  const btnValidate = document.getElementById("admin-validate");
  const error = document.getElementById("admin-error");

  function openModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    error.style.display = "none";
    input.value = "";
    setTimeout(() => input.focus(), 50);
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  function validateCode() {
    const value = input.value.trim();
    if (value === ADMIN_CODE) {
      window.location.href = "eaj-generator.html";
    } else {
      error.style.display = "block";
    }
  }

  link.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });

  backdrop.addEventListener("click", closeModal);
  btnCancel.addEventListener("click", closeModal);
  btnValidate.addEventListener("click", validateCode);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateCode();
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    }
  });
}

/* ---------- Init globale ---------- */

renderToutesLesSemaines();
initialiserFiltres();
initialiserThemeToggle();
renderLastUpdate();
renderAlert();
initialiserBackToTop();
initialiserAdminModal();