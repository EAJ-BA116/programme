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

// v1.2.0 — Meta
const APP_VERSION = "1.2.1";

// 📲 WhatsApp (format international sans + ni espaces). Exemple : 33612345678
// Laisse vide si tu ne veux pas afficher le bouton.
const WHATSAPP_PHONE = "33614732790";


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
  if (!el || typeof LAST_UPDATE === "undefined") return;
  el.textContent = `Programme mis à jour par ${LAST_UPDATE.auteur} le ${LAST_UPDATE.dateTexte}`;
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

  if (typeof ALERT_BANNERS !== "undefined" && Array.isArray(ALERT_BANNERS)) {
    banners = ALERT_BANNERS;
  } else if (typeof ALERT_BANNER !== "undefined" && ALERT_BANNER) {
    banners = [{
      actif: !!ALERT_BANNER.actif,
      emoji: "⚠️",
      texte: ALERT_BANNER.texte || "",
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

  // Modale admin
  const admin = document.getElementById("admin-modal");
  if(admin && admin.classList.contains("open")){
    admin.classList.remove("open");
    admin.setAttribute("aria-hidden","true");
  }
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
    const y = window.scrollY;
    if(y !== lastY && anyOverlayOpen()){
      closeOverlaysOnScroll();
    }
    lastY = y;
  }, { passive: true });

  // Mobile (swipe) + desktop (wheel) : on ferme si le geste n'est pas dans un overlay
  document.addEventListener("touchmove", (e) => {
    if(!anyOverlayOpen()) return;
    if(isTargetInsideOverlay(e.target)) return;
    closeOverlaysOnScroll();
  }, { passive: true });

  document.addEventListener("wheel", (e) => {
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

/* ---------- Init globale ---------- */

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
initialiserProjectsMenu();

initialiserBackToTop();
initialiserAdminModal();
