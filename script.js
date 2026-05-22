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

// v1.4.1 — Meta
const APP_VERSION = "1.4.1";

// 📲 WhatsApp (format international sans + ni espaces). Exemple : 33612345678
// Laisse vide si tu ne veux pas afficher le bouton.
const WHATSAPP_PHONE = "33614732790";

/* ---------- Source planning Supabase / fallback ---------- */

function getPlanningData() {
  if (window.EAJPlanning && typeof window.EAJPlanning.getCurrentData === "function") {
    return window.EAJPlanning.getCurrentData();
  }

  let semaines = [];
  let alertBanners = [];
  let alertBanner = { actif: false, texte: "" };
  let lastUpdate = { auteur: "", dateTexte: "" };

  try { if (typeof SEMAINES !== "undefined" && Array.isArray(SEMAINES)) semaines = SEMAINES; } catch (e) {}
  try { if (typeof ALERT_BANNERS !== "undefined" && Array.isArray(ALERT_BANNERS)) alertBanners = ALERT_BANNERS; } catch (e) {}
  try { if (typeof ALERT_BANNER !== "undefined" && ALERT_BANNER) alertBanner = ALERT_BANNER; } catch (e) {}
  try { if (typeof LAST_UPDATE !== "undefined" && LAST_UPDATE) lastUpdate = LAST_UPDATE; } catch (e) {}

  return { semaines, alertBanners, alertBanner, lastUpdate };
}

function getSemainesPlanning() {
  const data = getPlanningData();
  return Array.isArray(data.semaines) ? data.semaines : [];
}

function getLastUpdatePlanning() {
  return getPlanningData().lastUpdate || { auteur: "", dateTexte: "" };
}

function getAlertBannersPlanning() {
  const data = getPlanningData();
  return Array.isArray(data.alertBanners) ? data.alertBanners : [];
}

function getAlertBannerPlanning() {
  return getPlanningData().alertBanner || { actif: false, texte: "" };
}

function getFiltreActuel() {
  const filtersValides = ["all", "EAJ1", "EAJ2", "EAJ3"];
  try {
    const stored = localStorage.getItem("eaj_filter");
    if (stored && filtersValides.includes(stored)) return stored;
  } catch (e) {}
  return "all";
}

function rafraichirPlanningAffiche() {
  const filtre = getFiltreActuel();
  renderToutesLesSemaines();
  appliquerFiltre(filtre);
  renderAlert(filtre);
  renderLastUpdate();
}

function initialiserRealtimePlanning() {
  if (!window.EAJPlanning || typeof window.EAJPlanning.subscribePlanningUpdates !== "function") return;

  window.EAJPlanning.subscribePlanningUpdates(() => {
    rafraichirPlanningAffiche();

    const banner = document.getElementById("alert-banner");
    if (banner) {
      banner.insertAdjacentHTML("beforeend", `<div class="live-update-toast">Planning mis à jour automatiquement ✅</div>`);
      setTimeout(() => {
        const toast = banner.querySelector(".live-update-toast");
        if (toast) toast.remove();
      }, 3500);
    }
  });
}


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

  // 🔎 Infos spécifiques d’activité uniquement.
  // Les infos générales du groupe sont affichées sous la carte : pas de doublon sur chaque activité.
  const extras = [];
  const horaire  = activity.horaire  || "";
  const lieu     = activity.lieu     || "";
  const tenue    = activity.tenue    || "";
  const materiel = activity.materiel || "";
  const encadrant= activity.encadrant|| "";

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

  getSemainesPlanning().forEach((sem, idx) => {
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

  getSemainesPlanning().forEach((sem, idx) => {
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
  // Sécurité : si les boutons n'existent pas, on affiche quand même les bannières "Tous".
  if (!boutons.length) {
    renderAlert("all");
    return;
  }

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
  // 🔔 Bannière filtrée (EAJ1/2/3)
  renderAlert(filtreActuel);

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
      renderAlert(filter);

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
  const lastUpdate = getLastUpdatePlanning();
  if (!el || !lastUpdate) return;

  const auteur = lastUpdate.auteur || "";
  const dateTexte = lastUpdate.dateTexte || "";

  if (!auteur && !dateTexte) {
    el.textContent = "";
    return;
  }

  el.textContent = `Programme mis à jour par ${auteur || "EAJ"}${dateTexte ? " le " + dateTexte : ""}`;
}

function renderAlert(filtreActuel = "all") {
  const banner = document.getElementById("alert-banner");
  if (!banner) return;

  const TYPE_META = {
    information: { label: "Information", cls: "info" },
    attention:   { label: "Attention",   cls: "attention" },
    confirmation:{ label: "Confirmation",cls: "confirmation" },
    annonce:     { label: "Annonce",     cls: "annonce" },
    important:   { label: "Important",   cls: "important" }
  };

  const TYPE_FROM_EMOJI = {
    "⚠️": "attention",
    "ℹ️": "information",
    "✅": "confirmation",
    "📢": "annonce",
    "🚫": "important"
  };

  function normalizeType(b) {
    const t = (b && b.type) ? String(b.type).toLowerCase() : "";
    if (TYPE_META[t]) return t;
    const emoji = (b && b.emoji) ? String(b.emoji) : "";
    return TYPE_FROM_EMOJI[emoji] || "annonce";
  }

  function formatTargets(ciblesArr) {
    const cibles = Array.isArray(ciblesArr) ? ciblesArr : [];
    if (!cibles.length || cibles.includes("all")) return "Tous";
    const pretty = cibles.map(c => {
      if (c === "EAJ1") return "EAJ 1";
      if (c === "EAJ2") return "EAJ 2";
      if (c === "EAJ3") return "EAJ 3";
      return c;
    });
    return pretty.join(" + ");
  }

  // 🧩 Compat : ancien format (ALERT_BANNER) / nouveau format (ALERT_BANNERS)
  let banners = [];

  const configuredBanners = getAlertBannersPlanning();
  const legacyBanner = getAlertBannerPlanning();

  if (Array.isArray(configuredBanners) && configuredBanners.length > 0) {
    banners = configuredBanners;
  } else if (legacyBanner) {
    banners = [{
      actif: !!legacyBanner.actif,
      emoji: "⚠️",
      texte: legacyBanner.texte || "",
      cibles: ["all"]
    }];
  }

  // Nettoyage
  banner.innerHTML = "";
  banner.classList.remove("has-banners");

  // Date window (programmable banners)
  function parseDateLike(value) {
    if (!value) return null;
    const s = String(value).trim();
    if (!s) return null;

    // ISO: YYYY-MM-DD
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      const y = Number(iso[1]);
      const m = Number(iso[2]);
      const d = Number(iso[3]);
      const dt = new Date(y, m - 1, d);
      dt.setHours(0, 0, 0, 0);
      return isNaN(dt) ? null : dt;
    }

    // FR: DD/MM/YYYY or DD-MM-YYYY
    const fr = s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
    if (fr) {
      const d = Number(fr[1]);
      const m = Number(fr[2]);
      const y = Number(fr[3]);
      const dt = new Date(y, m - 1, d);
      dt.setHours(0, 0, 0, 0);
      return isNaN(dt) ? null : dt;
    }

    return null;
  }

  function isInDateWindow(b) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = parseDateLike(b.startDate || b.dateDebut || b.debut || "");
    const end = parseDateLike(b.endDate || b.dateFin || b.fin || "");

    if (start && today < start) return false;
    if (end && today > end) return false; // end is inclusive
    return true;
  }


  // Filtrage
  const visibles = (banners || [])
    .filter(b => b && b.actif && String(b.texte || "").trim().length > 0)
    .filter(b => isInDateWindow(b))
    .filter(b => {
      const cibles = Array.isArray(b.cibles) ? b.cibles : [];
      if (!cibles.length) return true; // si non précisé → visible pour tous
      if (cibles.includes("all")) return true;
      if (filtreActuel === "all") return true; // en vue "Tous" on affiche tout
      return cibles.includes(filtreActuel);
    });

  if (!visibles.length) return;

  // Affichage : une ligne = une bannière, avec couleur selon le type.
  visibles.forEach(b => {
    const type = normalizeType(b);
    const meta = TYPE_META[type] || TYPE_META.annonce;
    const targets = formatTargets(b.cibles);
    const message = String(b.texte || "").trim();
    const emoji = b.emoji ? String(b.emoji) : "";

    const line = document.createElement("div");
    line.className = `alert-line alert-line--${meta.cls}`;
    // Format demandé : [emoji] Annonce [EAJ 3] : [message]
    line.textContent = `${emoji ? emoji + " " : ""}${meta.label} [${targets}] : ${message}`;
    banner.appendChild(line);
  });

  banner.classList.add("has-banners");

  // Respecte le toggle "Afficher bannières"
  if (typeof window.__applyBannerVisibility === "function") {
    window.__applyBannerVisibility();
  }
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
  const link = document.getElementById("admin-link");
  const modal = document.getElementById("admin-modal");
  if (!link || !modal) return;

  const backdrop = modal.querySelector(".admin-modal-backdrop");
  const btnCancel = document.getElementById("admin-cancel");
  const btnValidate = document.getElementById("admin-validate");

  function openModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => btnValidate && btnValidate.focus(), 50);
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  function openGenerator() {
    window.location.href = "eaj-generator.html";
  }

  link.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });

  backdrop.addEventListener("click", closeModal);
  btnCancel.addEventListener("click", closeModal);
  btnValidate.addEventListener("click", openGenerator);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      e.preventDefault();
      closeModal();
    }
  });
}



/* ---------- Toggle affichage bannières (non mémorisé) ---------- */

function initialiserBannerToggle() {
  const cb = document.getElementById("banner-toggle");
  const banner = document.getElementById("alert-banner");
  if (!banner) return;

  const apply = () => {
    const visible = !cb ? true : !!cb.checked;
    banner.classList.toggle("is-hidden", !visible);
    banner.toggleAttribute("hidden", !visible);
  };

  if (cb) {
    cb.addEventListener("change", apply);
  }
  // Expose pour les autres fonctions (renderAlert) ✅
  window.__applyBannerVisibility = apply;

  apply(); // état par défaut
}


/* ---------- Menu déroulant "Nos projets" ---------- */

function initialiserProjectsMenu() {
  const btn = document.getElementById("projects-btn");
  const list = document.getElementById("projects-list");
  if (!btn || !list) return;

  const menu = document.getElementById("app-menu");
  const menuBtn = document.getElementById("menu-toggle");

  const closeList = () => {
    list.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  };

  const openList = () => {
    list.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  };

  const toggleList = () => (list.hidden ? openList() : closeList());

  // ✅ Toggle sur toute la ligne (desktop + mobile)
  // (on gère pointerup + click sans double déclenchement)
  let __projectsPointerLock = false;
  btn.addEventListener("pointerup", (e) => {
    __projectsPointerLock = true;
    e.preventDefault();
    toggleList();
    setTimeout(() => { __projectsPointerLock = false; }, 350);
  });

  btn.addEventListener("click", (e) => {
    if (__projectsPointerLock) return;
    e.preventDefault();
    toggleList();
  });

  // Click sur un projet (liens)
  list.querySelectorAll("a[href]").forEach((a) => {
    a.addEventListener("click", () => {
      // on ferme les UI, puis le navigateur ouvrira le lien (target=_blank)
      closeList();
      if (menu && menu.classList.contains("open")) {
        menu.classList.remove("open");
        menu.setAttribute("aria-hidden", "true");
        if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  });

  // Click dehors => ferme la liste
  document.addEventListener("click", (e) => {
    if (list.hidden) return;
    const t = e.target;
    if (btn.contains(t) || list.contains(t)) return;
    closeList();
  });

  // Si le menu se ferme, on ferme aussi la liste
  if (menu) {
    const obs = new MutationObserver(() => {
      closeList();});
    obs.observe(menu, { attributes: true, attributeFilter: ["class"] });
  }
}




/* ---------- Menu + modales (v1.2.0) ---------- */

function openModalById(id){
  const el=document.getElementById(id);
  if(!el) return;
  el.classList.add("open");
  el.setAttribute("aria-hidden","false");
}

function closeModalById(id){
  const el=document.getElementById(id);
  if(!el) return;
  el.classList.remove("open");
  el.setAttribute("aria-hidden","true");
}

/* ---------- Fermer les overlays au scroll ---------- */

function closeOverlaysOnScroll(){
  // Menu compact
  const menu = document.getElementById("app-menu");
  const menuBtn = document.getElementById("menu-toggle");
  if(menu && menu.classList.contains("open")){
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden","true");
    if(menuBtn) menuBtn.setAttribute("aria-expanded","false");
  }

  // Sous-liste "Nos projets"
  const pbtn = document.getElementById("projects-btn");
  const plist = document.getElementById("projects-list");
  if(pbtn && plist && !plist.hidden){
    plist.hidden = true;
    pbtn.setAttribute("aria-expanded","false");
  }

  // Modales standard
  closeModalById("about-modal");
  closeModalById("contact-modal");
  // ⚠️ v1.4.1 : on ne ferme PAS "Échange vêtements" au scroll

  // Modale admin
  const admin = document.getElementById("admin-modal");
  if(admin && admin.classList.contains("open")){
    admin.classList.remove("open");
    admin.setAttribute("aria-hidden","true");
  }
}

function isClothesModalOpen(){
  return !!document.getElementById("clothes-modal")?.classList.contains("open");
}

function isTargetInsideOverlay(target){
  const menuPanel = document.querySelector("#app-menu.open .menu-popover-panel");
  if(menuPanel && menuPanel.contains(target)) return true;

  const modalDialog = document.querySelector(".modal.open .modal-dialog");
  if(modalDialog && modalDialog.contains(target)) return true;

  const adminDialog = document.querySelector("#admin-modal.open .admin-modal-dialog");
  if(adminDialog && adminDialog.contains(target)) return true;

  return false;
}

function anyOverlayOpen(){
  const menuOpen = document.getElementById("app-menu")?.classList.contains("open");
  const modalOpen = !!document.querySelector(".modal.open");
  const adminOpen = document.getElementById("admin-modal")?.classList.contains("open");
  const plist = document.getElementById("projects-list");
  const projectsOpen = !!(plist && !plist.hidden);
  return !!(menuOpen || modalOpen || adminOpen || projectsOpen);
}

function initialiserCloseOnScroll(){
  let lastY = window.scrollY;

  window.addEventListener("scroll", () => {
    // v1.4.1 : pendant "Échange vêtements", on désactive la fermeture automatique au scroll
    if(isClothesModalOpen()){
      lastY = window.scrollY;
      return;
    }
    const y = window.scrollY;
    if(y !== lastY && anyOverlayOpen()){
      closeOverlaysOnScroll();
    }
    lastY = y;
  }, { passive: true });

  // Mobile (swipe) + desktop (wheel) : on ferme si le geste n'est pas dans un overlay
  document.addEventListener("touchmove", (e) => {
    if(isClothesModalOpen()) return;
    if(!anyOverlayOpen()) return;
    if(isTargetInsideOverlay(e.target)) return;
    closeOverlaysOnScroll();
  }, { passive: true });

  document.addEventListener("wheel", (e) => {
    if(isClothesModalOpen()) return;
    if(!anyOverlayOpen()) return;
    if(isTargetInsideOverlay(e.target)) return;
    closeOverlaysOnScroll();
  }, { passive: true });
}

function initialiserModales(){
  document.querySelectorAll("[data-modal-close]").forEach((btn)=>{
    btn.addEventListener("click",()=>closeModalById(btn.getAttribute("data-modal-close")));
  });
  document.addEventListener("keydown",(e)=>{
    if(e.key!=="Escape") return;
    document.querySelectorAll(".modal.open").forEach((m)=>{
      m.classList.remove("open");
      m.setAttribute("aria-hidden","true");
    });
  });
}

function initialiserMenu(){
  const btn = document.getElementById("menu-toggle");
  const menu = document.getElementById("app-menu");
  if(!btn || !menu) return;

  const panel = menu.querySelector(".menu-popover-panel");
  const closeEls = menu.querySelectorAll("[data-menu-close]");
  const items = menu.querySelectorAll("[data-action]");

  const open = () => {
    menu.classList.add("open");
    menu.setAttribute("aria-hidden","false");
    btn.setAttribute("aria-expanded","true");
  };

  const close = () => {
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden","true");
    btn.setAttribute("aria-expanded","false");
  };

  btn.addEventListener("click",(e)=>{
    e.preventDefault();
    e.stopPropagation();
    menu.classList.contains("open") ? close() : open();
  });

  closeEls.forEach(el => el.addEventListener("click",(e)=>{ e.preventDefault(); close(); }));

  // Click outside => close
  document.addEventListener("click",(e)=>{
    if(!menu.classList.contains("open")) return;
    const target = e.target;
    if(target === btn) return;
    if(panel && panel.contains(target)) return;
    close();
  });

  // Stop bubbling inside panel
  if(panel){
    panel.addEventListener("click",(e)=>e.stopPropagation());
  }

  items.forEach((it)=>{
    it.addEventListener("click",()=>{
      const act = it.getAttribute("data-action") || "";
      close();

      if(act === "open-about"){ openModalById("about-modal"); return; }
      if(act === "open-contact"){ openModalById("contact-modal"); return; }
      if(act === "open-admin"){ const a=document.getElementById("admin-link"); if(a) a.click(); return; }
      if(act === "open-clothes"){ openModalById("clothes-modal"); return; }
    });
  });

  document.addEventListener("keydown",(e)=>{
    if(e.key === "Escape" && menu.classList.contains("open")) close();
  });
}

function initialiserContactCopy(){
  const btnCopy=document.getElementById("copy-contact");
  const btnWa=document.getElementById("open-whatsapp");
  const ta=document.getElementById("contact-message");
  const hint=document.getElementById("copy-hint");

  if(!ta) return;

  const setHint=(msg)=>{ if(hint) hint.textContent=msg; };

  const getCurrentFilter=()=>{
    const a=document.querySelector(".btn-filter.active");
    return (a && a.dataset && a.dataset.filter) ? a.dataset.filter : "all";
  };

  const prettyFilter=(f)=>{
    if(f==="all") return "Tous";
    return f;
  };

  const buildPayload=()=>{
    const details=(ta.value||"").trim();
    const f=getCurrentFilter();
    const base =
`Bonjour Yoann, j'ai un bug sur Programme EAJ BA 116 (v${APP_VERSION}).\n` +
`Filtre: ${prettyFilter(f)}\n` +
`Page: ${location.href}\n\n` +
`Détails:\n${details || "(à compléter)"}`;
    return base;
  };

  // Copier
  if(btnCopy){
    btnCopy.addEventListener("click",async()=>{
      const payload=buildPayload();
      try{
        if(navigator.clipboard && navigator.clipboard.writeText){
          await navigator.clipboard.writeText(payload);
        }else{
          // fallback old-school
          const old = ta.value;
          ta.value = payload;
          ta.focus();
          ta.select();
          document.execCommand("copy");
          ta.value = old;
          ta.blur();
        }
        setHint("Message copié. ✅");
      }catch(e){
        setHint("Impossible de copier automatiquement.");
      }
    });
  }

  // WhatsApp
  if(btnWa){
    const phone = String(WHATSAPP_PHONE||"").trim();
    const phoneOk = /^\d{8,15}$/.test(phone);

    if(!phoneOk){
      // Bouton désactivé tant que le numéro n'est pas configuré
      btnWa.disabled = true;
      btnWa.title = "Numéro WhatsApp non configuré (WHATSAPP_PHONE dans script.js)";
      btnWa.style.opacity = "0.55";
      btnWa.style.cursor = "not-allowed";
    }else{
      btnWa.addEventListener("click",()=>{
        const payload=buildPayload();
        const waUrl=`https://wa.me/${phone}?text=${encodeURIComponent(payload)}`;
        window.open(waUrl,"_blank","noopener,noreferrer");
        setHint("WhatsApp ouvert. 📲");
      });
    }
  }
}



function initialiserClothesExchange(){
  const modalId = "clothes-modal";
  const modal = document.getElementById(modalId);
  const first = document.getElementById("clothes-firstname");
  const eaj = document.getElementById("clothes-eaj");
  const type = document.getElementById("clothes-type"); // hidden input (valeur)
  const typeTrigger = document.getElementById("clothes-type-trigger");
  const typeMenu = document.getElementById("clothes-type-menu");
  const typeTriggerIcon = typeTrigger ? typeTrigger.querySelector(".dd-trigger-icon") : null;
  const typeTriggerLabel = typeTrigger ? typeTrigger.querySelector(".dd-trigger-label") : null;
  const size = document.getElementById("clothes-size");
  const sizeWantedField = document.getElementById("clothes-size-wanted-field");
  const sizeWanted = document.getElementById("clothes-size-wanted");
  const btnWa = document.getElementById("clothes-whatsapp");
  const btnCopy = document.getElementById("clothes-copy");
  const hint = document.getElementById("clothes-hint");

  if(!first || !eaj || !type || !btnWa || !btnCopy || !size || !sizeWantedField || !sizeWanted) return;

  const phone = String(WHATSAPP_PHONE||"").trim();
  const phoneOk = /^\d{8,15}$/.test(phone);

  const getReason = ()=>{
    const r = document.querySelector('input[name="clothes-reason"]:checked');
    return r ? r.value : "";
  };

  const setType = (val, iconSrc)=>{
    type.value = val || "";

    // UI trigger
    if(typeTriggerLabel){
      typeTriggerLabel.textContent = type.value ? type.value : "Choisir un vêtement…";
    }
    if(typeTriggerIcon){
      typeTriggerIcon.innerHTML = "";
      if(iconSrc){
        const img = document.createElement("img");
        img.src = iconSrc;
        img.alt = "";
        typeTriggerIcon.appendChild(img);
      }
    }

    // Fermer menu
    if(typeMenu && !typeMenu.hidden){
      typeMenu.hidden = true;
      if(typeTrigger) typeTrigger.setAttribute("aria-expanded","false");
    }
  };

  const updateReasonUI = ()=>{
    const reason = getReason();
    const showWanted = reason === 'taille';
    sizeWantedField.hidden = !showWanted;
    if(!showWanted) sizeWanted.value = "";

    // Style sélection (2 cartes côte à côte)
    if(modal){
      modal.querySelectorAll(".motif-item").forEach(lbl=>{
        const inp = lbl.querySelector("input");
        lbl.classList.toggle("is-selected", !!(inp && inp.checked));
      });
    }
  };

  const setHint = (msg)=>{ if(hint) hint.textContent = msg || ""; };

  const resetForm = ()=>{
    first.value = "";
    eaj.value = "";
    setType("");
    size.value = "";
    sizeWanted.value = "";
    document.querySelectorAll('input[name="clothes-reason"]').forEach(i=> i.checked=false);
    updateReasonUI();
    setHint("");
    updateButtons();
  };

  const buildPayload = ()=>{
    const prenom = (first.value||"").trim();
    const groupe = (eaj.value||"").trim();
    const vetement = (type.value||"").trim();
    const reason = getReason();
    const taille = (size.value||"").trim();
    const tailleVoulue = (sizeWanted.value||"").trim();

    const reasonLabel = reason === "taille"
      ? "Échange de taille"
      : "Échange car cassé / abîmé";

    const intro = reason === 'taille'
      ? "Je souhaite faire un échange de taille pour un vêtement."
      : "Je souhaite faire un échange de vêtements (cassé / abîmé).";

    let msg =
`Bonjour Yoann,\n\n` +
`${intro}\n\n` +
`• Prénom : ${prenom || "(à compléter)"}\n` +
`• Groupe : ${groupe || "(à choisir)"}\n` +
`• Vêtement : ${vetement || "(à choisir)"}\n` +
`• Motif : ${reason ? reasonLabel : "(à choisir)"}\n`;

    msg += `• Taille du vêtement à échanger : ${taille || "(à compléter)"}\n`;

    if(reason === 'taille'){
      msg += `• Taille voulue : ${tailleVoulue || "(à compléter)"}\n`;
    }

    msg += `\nMerci.`;
    return msg;
  };

  const isValid = ()=>{
    const prenomOk = (first.value||"").trim().length > 0;
    const eajOk = (eaj.value||"").trim().length > 0;
    const typeOk = (type.value||"").trim().length > 0;
    const reason = getReason();
    if(!prenomOk || !eajOk || !typeOk || !reason) return false;

    // taille obligatoire dans tous les cas
    const sizeOk = (size.value||"").trim().length > 0;
    if(!sizeOk) return false;

    // si échange de taille, taille voulue obligatoire
    if(reason === 'taille'){
      const wantedOk = (sizeWanted.value||"").trim().length > 0;
      return wantedOk;
    }
    return true;
  };

  const updateButtons = ()=>{
    const ok = isValid();
    const canWa = phoneOk && ok;

    btnCopy.disabled = !ok;
    btnCopy.style.opacity = ok ? "" : "0.55";
    btnCopy.style.cursor = ok ? "" : "not-allowed";

    btnWa.disabled = !canWa;
    btnWa.style.opacity = canWa ? "" : "0.55";
    btnWa.style.cursor = canWa ? "" : "not-allowed";
    if(!phoneOk){
      btnWa.title = "Numéro WhatsApp non configuré (WHATSAPP_PHONE dans script.js)";
    }else if(!ok){
      btnWa.title = "Complète les champs obligatoires";
    }else{
      btnWa.title = "";
    }
  };


  // Dropdown type de vêtement
  const closeTypeMenu = ()=>{
    if(typeMenu && !typeMenu.hidden){
      typeMenu.hidden = true;
      if(typeTrigger) typeTrigger.setAttribute("aria-expanded","false");
    }
  };

  if(typeTrigger && typeMenu){
    typeTrigger.addEventListener("click", (e)=>{
      e.preventDefault();
      const willOpen = typeMenu.hidden;
      // fermer les autres menus
      closeTypeMenu();
      if(willOpen){
        typeMenu.hidden = false;
        typeTrigger.setAttribute("aria-expanded","true");
      }
    });

    typeMenu.querySelectorAll(".dd-item").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const val = btn.getAttribute("data-value") || "";
        const ico = btn.querySelector("img") ? btn.querySelector("img").getAttribute("src") : "";
        setType(val, ico);
        updateButtons();
      });
    });

    // click dehors / ESC
    document.addEventListener("click", (e)=>{
      if(!typeMenu.hidden){
        const t = e.target;
        if(typeTrigger.contains(t) || typeMenu.contains(t)) return;
        closeTypeMenu();
      }
    });
    document.addEventListener("keydown", (e)=>{
      if(e.key === "Escape") closeTypeMenu();
    });
  }

  // Mise à jour temps réel
  ["input","change"].forEach(evt=>{
    first.addEventListener(evt, updateButtons);
    eaj.addEventListener(evt, updateButtons);
    size.addEventListener(evt, updateButtons);
    sizeWanted.addEventListener(evt, updateButtons);
    document.querySelectorAll('input[name="clothes-reason"]').forEach(i=> i.addEventListener(evt, updateButtons));
  });


  // Motif -> afficher/masquer "taille voulue"
  document.querySelectorAll('input[name="clothes-reason"]').forEach(i=>{
    i.addEventListener('change', ()=>{
      updateReasonUI();
      updateButtons();
    });
  });

  // Copier
  btnCopy.addEventListener("click", async ()=>{
    if(!isValid()) { setHint("Complète les champs obligatoires."); return; }
    const payload = buildPayload();
    try{
      if(navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(payload);
      }else{
        const tmp = document.createElement("textarea");
        tmp.value = payload;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        tmp.remove();
      }
      setHint("Message copié. ✅");
    }catch(e){
      setHint("Impossible de copier automatiquement.");
    }
  });

  // WhatsApp
  btnWa.addEventListener("click", ()=>{
    if(!isValid()) { setHint("Complète les champs obligatoires."); return; }
    if(!phoneOk) { setHint("Numéro WhatsApp non configuré."); return; }
    const payload = buildPayload();
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(payload)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setHint("WhatsApp ouvert. 📲");
  });

  // Reset à l'ouverture/fermeture de la modale
  if(modal){
    // Quand on ouvre
    const obs = new MutationObserver(()=>{
      if(modal.classList.contains("open")) resetForm();
    });
    obs.observe(modal, { attributes:true, attributeFilter:["class"] });
  }

  updateButtons();
}

/* ---------- Init globale ---------- */

async function initApp() {
  if (window.EAJPlanning && typeof window.EAJPlanning.loadPublicPlanning === "function") {
    await window.EAJPlanning.loadPublicPlanning();
  }

  renderToutesLesSemaines();

  // Toggle bannières d'abord, pour que le premier renderAlert (appelé par initialiserFiltres)
  // respecte l'état "Afficher bannières".
  initialiserBannerToggle();

  // Filtre (lit localStorage) + rend la bannière filtrée au bon groupe dès l'initialisation.
  initialiserFiltres();

  initialiserThemeToggle();
  renderLastUpdate();

  initialiserMenu();
  initialiserModales();
  initialiserCloseOnScroll();
  initialiserContactCopy();
  initialiserClothesExchange();
  initialiserProjectsMenu();

  initialiserBackToTop();
  initialiserAdminModal();
  initialiserRealtimePlanning();
}

initApp().catch((error) => {
  console.error("Erreur d'initialisation du site EAJ :", error);
  renderToutesLesSemaines();
  initialiserBannerToggle();
  initialiserFiltres();
  initialiserThemeToggle();
  renderLastUpdate();
  initialiserMenu();
  initialiserModales();
  initialiserCloseOnScroll();
  initialiserContactCopy();
  initialiserClothesExchange();
  initialiserProjectsMenu();
  initialiserBackToTop();
  initialiserAdminModal();
});
