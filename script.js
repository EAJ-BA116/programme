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

// v1.8.2 — Meta
const APP_VERSION = "1.9.0";

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
  let settings = { mergeEaj23: true };

  try { if (typeof SEMAINES !== "undefined" && Array.isArray(SEMAINES)) semaines = SEMAINES; } catch (e) {}
  try { if (typeof ALERT_BANNERS !== "undefined" && Array.isArray(ALERT_BANNERS)) alertBanners = ALERT_BANNERS; } catch (e) {}
  try { if (typeof ALERT_BANNER !== "undefined" && ALERT_BANNER) alertBanner = ALERT_BANNER; } catch (e) {}
  try { if (typeof LAST_UPDATE !== "undefined" && LAST_UPDATE) lastUpdate = LAST_UPDATE; } catch (e) {}
  try { if (typeof PLANNING_SETTINGS !== "undefined" && PLANNING_SETTINGS) settings = PLANNING_SETTINGS; } catch (e) {}

  return { semaines, alertBanners, alertBanner, lastUpdate, settings };
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

function getPlanningSettings() {
  const settings = getPlanningData().settings || {};
  return { mergeEaj23: settings.mergeEaj23 !== false };
}

function isEaj23MergeEnabledPublic() {
  return getPlanningSettings().mergeEaj23 !== false;
}

function getStoredGroupIdPublic(group) {
  if (!group || typeof group.titre !== "string") return "";
  if (Array.isArray(group.groupIds) && group.groupIds.includes("EAJ2") && group.groupIds.includes("EAJ3")) return "EAJ23";
  const title = group.titre.replace(/\s+/g, " ");
  if (title.includes("EAJ 2-3") || title.includes("EAJ2-3") || title.includes("EAJ 2 / 3")) return "EAJ23";
  if (title.includes("EAJ1")) return "EAJ1";
  if (title.includes("EAJ2")) return "EAJ2";
  if (title.includes("EAJ3")) return "EAJ3";
  return "";
}

function getStoredGroupIdsPublic(group) {
  const id = getStoredGroupIdPublic(group);
  if (id === "EAJ23") return ["EAJ2", "EAJ3"];
  return id ? [id] : [];
}

function inferWeekEaj23ModePublic(week) {
  const explicit = week?.eaj23Mode;
  if (["merged", "EAJ2", "EAJ3", "separate"].includes(explicit)) return explicit;
  const ids = new Set((week?.groupes || []).map(getStoredGroupIdPublic).filter(Boolean));
  if (ids.has("EAJ23")) return "merged";
  if (ids.has("EAJ2") && ids.has("EAJ3")) return "separate";
  if (ids.has("EAJ2")) return "EAJ2";
  if (ids.has("EAJ3")) return "EAJ3";
  return isEaj23MergeEnabledPublic() ? "merged" : "separate";
}

function formatGroupTargetsPublic(groupes) {
  const list = Array.isArray(groupes) ? groupes.filter(Boolean) : [];
  if (!list.length || list.includes("all")) return "Tous les groupes";

  const labels = [];
  if (list.includes("EAJ1")) labels.push("EAJ 1");
  const has2 = list.includes("EAJ2");
  const has3 = list.includes("EAJ3");
  if (isEaj23MergeEnabledPublic() && has2 && has3) {
    labels.push("EAJ 2-3");
  } else {
    if (has2) labels.push("EAJ 2");
    if (has3) labels.push("EAJ 3");
  }
  list.forEach(id => {
    if (!["EAJ1", "EAJ2", "EAJ3", "all"].includes(id)) labels.push(id);
  });
  return labels.join(" + ");
}

function syncGroupFilterButtons() {
  // v1.8.2 : l’interface publique reste toujours simple :
  // Tous / EAJ1 / EAJ 2-3. EAJ2 et EAJ3 sont uniquement des sous-filtres.
  const btn23 = document.querySelector('.btn-filter[data-filter="EAJ23"]');
  const subfilters = document.getElementById("eaj23-subfilters");

  if (btn23) btn23.hidden = false;

  let stored = "all";
  try { stored = localStorage.getItem("eaj_filter") || "all"; } catch (e) {}

  if (subfilters) {
    subfilters.hidden = !["EAJ23", "EAJ2", "EAJ3"].includes(stored);
  }
}

function getFiltreActuel() {
  const filtersValides = ["all", "EAJ1", "EAJ23", "EAJ2", "EAJ3"];
  try {
    const stored = localStorage.getItem("eaj_filter");
    if (stored && filtersValides.includes(stored)) return stored;
  } catch (e) {}
  return "all";
}

function getActiviteFiltersValides() {
  return ["all", ...Object.keys(TYPES_ACTIVITE)];
}

function getFiltreActiviteActuel() {
  const filtersValides = getActiviteFiltersValides();
  try {
    const stored = localStorage.getItem("eaj_activity_filter");
    if (stored && filtersValides.includes(stored)) return stored;
  } catch (e) {}
  return "all";
}

function getActivityType(activity) {
  const type = String((activity && activity.type) || "autre").trim();
  return TYPES_ACTIVITE[type] ? type : "autre";
}

function getActivityListForFilter(list, activityFilter = getFiltreActiviteActuel()) {
  const activities = getActivityListSafe(list);
  if (activityFilter === "all") return activities;
  return activities.filter(activity => getActivityType(activity) === activityFilter);
}

function getCurrentGroupFilterFromUiOrStorage() {
  const activeSubs = Array.from(document.querySelectorAll(".btn-subfilter.active"));
  if (activeSubs.length >= 2) return "EAJ23";
  if (activeSubs.length === 1 && activeSubs[0].dataset?.filter) return activeSubs[0].dataset.filter;

  const active = document.querySelector(".btn-filter.active");
  if (active && active.dataset && active.dataset.filter) return active.dataset.filter;
  return getFiltreActuel();
}

function setGroupFilterUi(filter) {
  const boutons = document.querySelectorAll(".btn-filter");
  const subButtons = document.querySelectorAll(".btn-subfilter");
  const subfilters = document.getElementById("eaj23-subfilters");
  const inEaj23 = ["EAJ23", "EAJ2", "EAJ3"].includes(filter);

  boutons.forEach(btn => {
    const value = btn.dataset.filter || "all";
    const parentActive = value === "EAJ23" && inEaj23;
    btn.classList.toggle("active", parentActive || value === filter);
    btn.setAttribute("aria-pressed", (parentActive || value === filter) ? "true" : "false");
  });

  subButtons.forEach(btn => {
    const value = btn.dataset.filter || "";
    // EAJ23 = les deux sous-groupes sélectionnés.
    const active = filter === "EAJ23" || value === filter;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  if (subfilters) subfilters.hidden = !inEaj23;
}

function getActivityFilterLabel(filter = getFiltreActiviteActuel()) {
  if (filter === "all") return "toutes les activités";
  const cfg = TYPES_ACTIVITE[filter] || TYPES_ACTIVITE.autre;
  return `${cfg.emoji} ${cfg.label}`;
}

function rafraichirPlanningAffiche() {
  syncGroupFilterButtons();
  const filtre = getFiltreActuel();
  setGroupFilterUi(filtre);
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
  const isTricolore = activity.cartoucheStyle === "tricolore";
  chip.className = `activity-chip${isTricolore ? " activity-chip-tricolore" : ""}`;
  chip.dataset.activityType = getActivityType(activity);

  // 🎨 fond teinté selon l’activité, avec style tricolore optionnel choisi par l'admin.
  const baseColor = typeCfg.color;
  if (isTricolore) {
    chip.style.background = "linear-gradient(105deg, rgba(0,85,164,.30) 0%, rgba(0,85,164,.20) 30%, rgba(255,255,255,.94) 50%, rgba(239,65,53,.20) 70%, rgba(239,65,53,.30) 100%)";
    chip.style.borderLeft = "4px solid #0055a4";
    chip.style.borderRight = "4px solid #ef4135";
  } else {
    const bgColor = baseColor.length === 7 ? baseColor + "25" : baseColor;
    chip.style.background = bgColor;
    chip.style.borderLeft = `4px solid ${baseColor}`;
  }

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


function getActivityListSafe(list) {
  return Array.isArray(list) ? list.filter(a => a && String(a.texte || "").trim()) : [];
}

function hasMeaningfulCommonEntry(entry, activityFilter = "all") {
  if (!entry) return false;
  if (getActivityListForFilter(entry.activites, activityFilter).length > 0) return true;

  // En filtre par activité, on ne garde que les blocs qui contiennent réellement cette activité.
  // Les infos générales seules ne doivent pas ressortir dans un filtre "Sport", "Drone", etc.
  if (activityFilter !== "all") return false;

  return Boolean(
    String(entry.horaire || "").trim() ||
    String(entry.lieu || "").trim() ||
    String(entry.tenue || "").trim() ||
    String(entry.materiel || "").trim() ||
    String(entry.encadrant || "").trim() ||
    String(entry.tag || "").trim()
  );
}

function hasMeaningfulGroupEntry(group, activityFilter = "all") {
  if (!group) return false;
  if (getActivityListForFilter(group.activites, activityFilter).length > 0) return true;

  // Même logique : si on filtre par activité, une carte avec seulement des infos générales est masquée.
  if (activityFilter !== "all") return false;

  return Boolean(
    String(group.horaire || "").trim() ||
    String(group.lieu || "").trim() ||
    String(group.tenue || "").trim() ||
    String(group.materiel || "").trim() ||
    String(group.encadrant || "").trim() ||
    String(group.tag || "").trim()
  );
}

function addCommonGroupsToSet(entry, set) {
  if (!entry || !set) return;
  const groupes = Array.isArray(entry.groupes) ? entry.groupes.filter(Boolean) : [];
  if (!groupes.length) {
    ["EAJ1", "EAJ2", "EAJ3", "EAJ23"].forEach(id => set.add(id));
    return;
  }
  groupes.forEach(id => set.add(id));
  if (groupes.includes("EAJ2") && groupes.includes("EAJ3")) set.add("EAJ23");
}

function appendActivitiesBlock(parent, activities) {
  const list = getActivityListSafe(activities);
  if (!parent || !list.length) return;

  const label = document.createElement("p");
  label.className = "label";
  label.textContent = "Activités :";

  const container = document.createElement("div");
  container.className = "activities-list";

  list.forEach(a => container.appendChild(createActivityChip(a)));
  parent.appendChild(label);
  parent.appendChild(container);
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
  const activityFilter = getFiltreActiviteActuel();
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
    if (activityFilter !== "all") return null;
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
  const commonEntries = Array.isArray(p.activitesCommunes)
    ? p.activitesCommunes.filter(entry => hasMeaningfulCommonEntry(entry, activityFilter))
    : [];

  const presentGroups = new Set();
  commonEntries.forEach(entry => addCommonGroupsToSet(entry, presentGroups));

  if (commonEntries.length > 0) {
    commonEntries.forEach(entry => {
      const card = document.createElement("article");
      card.className = "group-card week-common-card";

      const groupes = Array.isArray(entry.groupes) ? entry.groupes.filter(Boolean) : [];
      card.dataset.groups = groupes.join(",");

      const groupesLabel = groupes.length
        ? "Groupes concernés : " + formatGroupTargetsPublic(groupes)
        : "Tous les groupes";

      card.innerHTML = `
        <div class="week-common-emoji">🤝</div>
        <div class="week-common-title">Activité commune</div>
        <div class="week-common-groups">${groupesLabel}</div>

        ${buildInfoBlock("Horaire :", entry.horaire || "")}
        ${buildInfoBlock("Lieu :", entry.lieu || "")}
        ${buildInfoBlock("Tenue :", entry.tenue || "")}
        ${buildInfoBlock("Matériel à apporter :", entry.materiel || "")}

        ${buildTagLine(entry.encadrant || "", entry.tag || "Activité commune")}
      `;

      const infoAnchor = card.querySelector(".label") || card.querySelector(".tag-line");
      const activities = getActivityListForFilter(entry.activites, activityFilter);
      card.dataset.activityTypes = activities.map(getActivityType).join(",");
      if (activities.length) {
        const frag = document.createElement("div");
        appendActivitiesBlock(frag, activities);
        const nodes = Array.from(frag.childNodes);
        if (infoAnchor) {
          nodes.forEach(node => card.insertBefore(node, infoAnchor));
        } else {
          nodes.forEach(node => card.appendChild(node));
        }
      }

      section.appendChild(card);
    });
  }

  // 👥 Groupes EAJ1 / EAJ2 / EAJ3
  const groupsContainer = document.createElement("div");
  groupsContainer.className = "groups";

  (p.groupes || []).forEach(g => {
    // sécurité : si g ou son titre est absent, on saute
    if (!g || typeof g.titre !== "string" || !hasMeaningfulGroupEntry(g, activityFilter)) {
      return;
    }

    const article = document.createElement("article");
    article.className = "group-card";

    const titre = g.titre || "";
    const groupId = getStoredGroupIdPublic(g);
    const groupIds = getStoredGroupIdsPublic(g);

    if (groupId) presentGroups.add(groupId);
    groupIds.forEach(id => presentGroups.add(id));

    article.dataset.group = groupId;
    article.dataset.groups = groupIds.join(",");

    article.innerHTML = `
      <div class="group-title">${titre}</div>

      ${buildInfoBlock("Horaire (général) :", g.horaire || "")}
      ${buildInfoBlock("Lieu (général) :", g.lieu || "")}
      ${buildInfoBlock("Tenue (générale) :", g.tenue || "")}
      ${buildInfoBlock("Matériel à apporter (général) :", g.materiel || "")}

      ${buildTagLine(g.encadrant || "", g.tag || "")}
    `;

    const infoAnchor = article.querySelector(".label") || article.querySelector(".tag-line");
    const activities = getActivityListForFilter(g.activites, activityFilter);
    article.dataset.activityTypes = activities.map(getActivityType).join(",");
    if (activities.length) {
      const frag = document.createElement("div");
      appendActivitiesBlock(frag, activities);
      const nodes = Array.from(frag.childNodes);
      if (infoAnchor) {
        nodes.forEach(node => article.insertBefore(node, infoAnchor));
      } else {
        nodes.forEach(node => article.appendChild(node));
      }
    }

    groupsContainer.appendChild(article);
  });

  // 🛑 Groupes absents : la structure dépend de l'organisation choisie pour la semaine.
  const weekMode = inferWeekEaj23ModePublic(p);
  const secondaryGroups = weekMode === "merged"
    ? [{ id: "EAJ23", ids: ["EAJ2", "EAJ3"], titre: "Groupe 2-3 – EAJ 2-3", short: "EAJ 2-3" }]
    : weekMode === "EAJ2"
      ? [{ id: "EAJ2", ids: ["EAJ2"], titre: "Groupe 2 – EAJ2", short: "EAJ2" }]
      : weekMode === "EAJ3"
        ? [{ id: "EAJ3", ids: ["EAJ3"], titre: "Groupe 3 – EAJ3", short: "EAJ3" }]
        : [
            { id: "EAJ2", ids: ["EAJ2"], titre: "Groupe 2 – EAJ2", short: "EAJ2" },
            { id: "EAJ3", ids: ["EAJ3"], titre: "Groupe 3 – EAJ3", short: "EAJ3" }
          ];
  const ALL_GROUPS = [{ id: "EAJ1", ids: ["EAJ1"], titre: "Groupe 1 – EAJ1", short: "EAJ1" }, ...secondaryGroups];

  if (activityFilter === "all") {
    ALL_GROUPS.forEach(gMeta => {
      const isPresent = gMeta.id === "EAJ23"
        ? (presentGroups.has("EAJ23") || (presentGroups.has("EAJ2") && presentGroups.has("EAJ3")))
        : presentGroups.has(gMeta.id);

      if (!isPresent) {
        const article = document.createElement("article");
        article.className = "group-card group-card-off";
        article.dataset.group = gMeta.id;
        article.dataset.groups = gMeta.ids.join(",");

        article.innerHTML = `
          <div class="group-title">${gMeta.titre}</div>
          <div class="group-off">
            <div class="group-off-emoji">🛑</div>
            <div class="group-off-title">Pas de séance ${gMeta.short}</div>
            <p class="group-off-text">
              Ce groupe n'est pas convoqué pour cette date.
            </p>
          </div>
        `;

        groupsContainer.appendChild(article);
      }
    });
  }

  if (groupsContainer.children.length > 0) {
    section.appendChild(groupsContainer);
  }

  const hasVisibleContent = section.querySelector(".week-off, .group-card");
  return hasVisibleContent ? section : null;
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
    if (section) container.appendChild(section);
  });

  if (!container.children.length) {
    const activityFilter = getFiltreActiviteActuel();
    const message = activityFilter === "all"
      ? "Aucune séance à afficher pour le moment."
      : `Aucune activité trouvée pour le filtre ${getActivityFilterLabel(activityFilter)}.`;

    container.innerHTML = `
      <section class="week empty-filter-state">
        <div class="empty-filter-icon">🔎</div>
        <div class="empty-filter-title">Aucun résultat</div>
        <p>${message}</p>
      </section>
    `;
  }
}

/* ---------- Filtre EAJ1 / EAJ2 / EAJ3 ---------- */

function updateWeekVisibilityAfterFilters() {
  const activityFilter = getFiltreActiviteActuel();

  document.querySelectorAll(".week").forEach(section => {
    const offBlock = section.querySelector(".week-off");
    if (offBlock) {
      section.style.display = activityFilter === "all" ? "" : "none";
      return;
    }

    const visibleCards = Array.from(section.querySelectorAll(".group-card"))
      .some(card => card.style.display !== "none");

    section.style.display = visibleCards ? "" : "none";
  });
}

function appliquerFiltre(nomGroupe) {
  const cartes = document.querySelectorAll(".group-card");

  cartes.forEach(carte => {
    if (nomGroupe === "all") {
      carte.style.display = "";
      return;
    }

    const groupsAttr = carte.dataset.groups || "";
    const list = groupsAttr
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    // Une activité commune sans cibles explicites concerne tout le monde.
    if (carte.classList.contains("week-common-card") && !list.length) {
      carte.style.display = "";
      return;
    }

    if (nomGroupe === "EAJ23") {
      carte.style.display = (list.includes("EAJ2") || list.includes("EAJ3")) ? "" : "none";
      return;
    }

    carte.style.display = list.includes(nomGroupe) ? "" : "none";
  });

  updateWeekVisibilityAfterFilters();
}

function initialiserFiltreActivite() {
  const select = document.getElementById("activity-filter");
  if (!select) return;

  const options = [
    { value: "all", label: "📋 Toutes les activités" },
    ...Object.entries(TYPES_ACTIVITE).map(([value, cfg]) => ({
      value,
      label: `${cfg.emoji} ${cfg.label}`
    }))
  ];

  select.innerHTML = options
    .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
    .join("");

  let activityFilter = getFiltreActiviteActuel();
  if (!getActiviteFiltersValides().includes(activityFilter)) activityFilter = "all";
  select.value = activityFilter;

  select.addEventListener("change", () => {
    const nextActivityFilter = getActiviteFiltersValides().includes(select.value) ? select.value : "all";

    try {
      localStorage.setItem("eaj_activity_filter", nextActivityFilter);
    } catch (e) {}

    let groupFilter = getCurrentGroupFilterFromUiOrStorage();

    // Quand on passe en mode "par activité", on repart de base sur Tous les groupes.
    if (nextActivityFilter !== "all") {
      groupFilter = "all";
      try { localStorage.setItem("eaj_filter", "all"); } catch (e) {}
      setGroupFilterUi("all");
    }

    renderToutesLesSemaines();
    appliquerFiltre(groupFilter);
    renderAlert(groupFilter);
  });
}

function initialiserFiltres() {
  const mainButtons = document.querySelectorAll(".btn-filter");
  const subButtons = document.querySelectorAll(".btn-subfilter");

  if (!mainButtons.length) {
    renderAlert("all");
    return;
  }

  let filtreActuel = getFiltreActuel();

  // Si un filtre activité est actif, on démarre toujours sur Tous les groupes.
  if (getFiltreActiviteActuel() !== "all") {
    filtreActuel = "all";
    try { localStorage.setItem("eaj_filter", "all"); } catch (e) {}
  }

  const applyAndStore = (filter) => {
    appliquerFiltre(filter);
    renderAlert(filter);
    setGroupFilterUi(filter);
    try { localStorage.setItem("eaj_filter", filter); } catch (e) {}
  };

  appliquerFiltre(filtreActuel);
  renderAlert(filtreActuel);
  setGroupFilterUi(filtreActuel);

  // Ligne principale : Tous / EAJ1 / EAJ 2-3.
  mainButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      applyAndStore(btn.dataset.filter || "all");
    });
  });

  // EAJ2 et EAJ3 fonctionnent comme deux cases cumulables sous EAJ 2-3.
  // Les deux actifs = filtre EAJ23. Un seul actif = filtre EAJ2 ou EAJ3.
  subButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const clicked = btn.dataset.filter || "";
      if (!['EAJ2', 'EAJ3'].includes(clicked)) return;

      const current = getFiltreActuel();
      let next = clicked;

      if (current === "EAJ23") {
        // On décoche le bouton touché et on garde l'autre.
        next = clicked === "EAJ2" ? "EAJ3" : "EAJ2";
      } else if (current === "EAJ2" || current === "EAJ3") {
        if (current === clicked) {
          // Au moins un sous-groupe doit rester sélectionné.
          next = current;
        } else {
          // Ajout du deuxième sous-groupe = les deux.
          next = "EAJ23";
        }
      } else {
        next = clicked;
      }

      applyAndStore(next);
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
    const label = formatGroupTargetsPublic(ciblesArr);
    return label === "Tous les groupes" ? "Tous" : label;
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
      if (filtreActuel === "EAJ23") return cibles.includes("EAJ2") || cibles.includes("EAJ3");
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
  // v1.8.2 : le menu principal reste ouvert pendant un scroll,
  // une molette ou un glissement tactile. Il se ferme uniquement
  // via X, Échap, un choix du menu ou un clic en dehors.
  // La sous-liste « Nos projets » reste elle aussi ouverte pendant le défilement.


  // Modales standard
  closeModalById("about-modal");
  closeModalById("contact-modal");
  closeModalById("push-preferences-modal");
  closeModalById("info-journal-modal");
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
  // v1.8.2 : aucun menu ni aucune fenêtre ne se ferme lors d’un scroll.
  // Le défilement à la molette et au doigt doit uniquement faire défiler le contenu.
  // Les overlays se ferment via leur bouton X/Fermer, Échap, une action explicite
  // ou un clic sur leur fond lorsque celui-ci est prévu.
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
      if(act === "open-info-journal"){ openInfoJournal(); return; }
      if(act === "open-contact"){ openModalById("contact-modal"); return; }
      if(act === "open-admin"){ const a=document.getElementById("admin-link"); if(a) a.click(); return; }
      if(act === "open-clothes"){ openModalById("clothes-modal"); return; }
      if(act === "manage-push"){ openPushPreferences(); return; }
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
    return typeof getCurrentGroupFilterFromUiOrStorage === "function"
      ? getCurrentGroupFilterFromUiOrStorage()
      : "all";
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

/* ---------- Mode hors ligne ---------- */

function formatOfflineCacheDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }).format(new Date(value));
  } catch (error) {
    return "";
  }
}

function refreshOfflineStatus() {
  const el = document.getElementById("offline-status");
  if (!el) return;

  const data = getPlanningData();
  const offline = navigator.onLine === false;
  const usingLocalCopy = data?.source === "offline-cache";

  if (!offline && !usingLocalCopy) {
    el.hidden = true;
    el.textContent = "";
    return;
  }

  const cachedAt = formatOfflineCacheDate(data?.cachedAt);
  el.hidden = false;
  if (offline) {
    el.textContent = cachedAt
      ? `📡 Hors connexion — dernier planning disponible sur cet appareil (${cachedAt}).`
      : "📡 Hors connexion — affichage du dernier planning disponible sur cet appareil.";
  } else {
    el.textContent = "⚠️ Serveur momentanément indisponible — affichage de la dernière copie locale du planning.";
  }
}

async function refreshPlanningAfterReconnect() {
  refreshOfflineStatus();
  if (!navigator.onLine || !window.EAJPlanning?.fetchPlanningFromSupabase) return;

  try {
    await window.EAJPlanning.fetchPlanningFromSupabase();
    syncGroupFilterButtons();
    renderToutesLesSemaines();
    const currentGroup = getCurrentGroupFilterFromUiOrStorage();
    appliquerFiltre(currentGroup);
    renderAlert(currentGroup);
    renderLastUpdate();
    refreshOfflineStatus();
    primeInfoJournalCache();
  } catch (error) {
    console.warn("Reconnexion : actualisation Supabase impossible :", error);
    refreshOfflineStatus();
  }
}

function initialiserOfflineMode() {
  refreshOfflineStatus();
  window.addEventListener("offline", refreshOfflineStatus);
  window.addEventListener("online", refreshPlanningAfterReconnect);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js?v=1.9.0", { scope: "./" })
      .catch((error) => console.warn("Service Worker hors ligne indisponible :", error));
  }
}

/* ---------- Journal des dernières informations ---------- */

const JOURNAL_KIND_META = {
  information: ["ℹ️", "Information"],
  programme: ["📅", "Programme / activité"],
  modification: ["🔄", "Modification"],
  cancellation: ["❌", "Annulation"],
  document: ["📄", "Document / consigne"],
  update: ["🆕", "Mise à jour application"],
  important: ["🚨", "Important"]
};

const JOURNAL_AUDIENCE_LABELS = {
  all_active: "Tous les abonnés",
  all_eaj: "Tous les EAJ",
  eaj1: "EAJ1",
  eaj2: "EAJ2",
  eaj3: "EAJ3",
  eaj23: "EAJ 2-3",
  system: "Mises à jour système"
};

function journalEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatJournalDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }).format(new Date(value));
  } catch (error) {
    return String(value);
  }
}

function renderInfoJournal(items) {
  const list = document.getElementById("info-journal-list");
  if (!list) return;

  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) {
    list.innerHTML = '<div class="info-journal-empty">Aucune information publiée pour le moment.</div>';
    return;
  }

  list.innerHTML = rows.map((item) => {
    const kind = String(item.kind || "information");
    const meta = JOURNAL_KIND_META[kind] || JOURNAL_KIND_META.information;
    const audience = JOURNAL_AUDIENCE_LABELS[String(item.audience || "all_eaj")] || String(item.audience || "");
    const importantClass = kind === "important" ? " is-important" : "";
    return `
      <article class="info-journal-item${importantClass}">
        <div class="info-journal-head">
          <div class="info-journal-title">${meta[0]} ${journalEscape(item.title || "EAJ BA 116")}</div>
          <div class="info-journal-date">${journalEscape(formatJournalDate(item.created_at))}</div>
        </div>
        <div class="info-journal-body">${journalEscape(item.body || "")}</div>
        <div class="info-journal-meta">
          <span class="info-journal-chip">${journalEscape(meta[1])}</span>
          <span class="info-journal-chip">${journalEscape(audience)}</span>
        </div>
      </article>`;
  }).join("");
}

async function loadInfoJournal({ showLoading = true } = {}) {
  const status = document.getElementById("info-journal-status");
  if (status && showLoading) status.textContent = "Actualisation…";

  try {
    const items = window.EAJPlanning?.listPublicInfoJournal
      ? await window.EAJPlanning.listPublicInfoJournal(30)
      : [];
    renderInfoJournal(items);
    if (status) {
      status.textContent = navigator.onLine
        ? `${items.length} information${items.length > 1 ? "s" : ""} récente${items.length > 1 ? "s" : ""}.`
        : "📡 Hors connexion — journal enregistré sur cet appareil.";
    }
    return items;
  } catch (error) {
    console.warn("Journal des informations indisponible :", error);
    const cached = window.EAJPlanning?.getCachedInfoJournal?.() || [];
    renderInfoJournal(cached);
    if (status) status.textContent = cached.length
      ? "📡 Version locale du journal affichée."
      : "Journal indisponible pour le moment.";
    return cached;
  }
}

function openInfoJournal() {
  openModalById("info-journal-modal");
  loadInfoJournal();
}

function initialiserInfoJournal() {
  const refreshBtn = document.getElementById("info-journal-refresh");
  if (refreshBtn) refreshBtn.addEventListener("click", () => loadInfoJournal());
}

function primeInfoJournalCache() {
  if (!navigator.onLine || !window.EAJPlanning?.listPublicInfoJournal) return;
  window.EAJPlanning.listPublicInfoJournal(30).catch((error) => {
    console.warn("Préchargement du journal impossible :", error);
  });
}

/* ---------- Notifications push ---------- */

let __eajPushRegistration = null;

const EMPTY_PUSH_PREFS = Object.freeze({
  eaj1: false,
  eaj2: false,
  eaj3: false,
  systemUpdates: false
});

function pushIsSupported() {
  return (
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function getPushPublicKeyConfigured() {
  if (!window.EAJPlanning || typeof window.EAJPlanning.getPushPublicKey !== "function") return "";
  return window.EAJPlanning.getPushPublicKey();
}

function base64UrlToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map(char => char.charCodeAt(0)));
}

async function getPushServiceWorkerRegistration() {
  if (__eajPushRegistration) return __eajPushRegistration;
  if (!pushIsSupported()) return null;

  __eajPushRegistration = await navigator.serviceWorker.register("./sw.js?v=1.9.0", {
    scope: "./",
    updateViaCache: "none"
  });

  return __eajPushRegistration;
}

async function getCurrentPushSubscription() {
  const registration = await getPushServiceWorkerRegistration();
  if (!registration) return null;
  return await registration.pushManager.getSubscription();
}

function setPushMenuStatus(message = "", state = "") {
  const el = document.getElementById("push-menu-status");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("ok", "warn", "error");
  if (state) el.classList.add(state);
}

function setPushPreferencesStatus(message = "", state = "") {
  const el = document.getElementById("push-preferences-status");
  if (!el) return;
  el.textContent = message;
  el.classList.remove("ok", "warn", "error");
  if (state) el.classList.add(state);
}

function readPushPreferencesForm() {
  return {
    eaj1: document.getElementById("push-pref-eaj1")?.checked === true,
    eaj2: document.getElementById("push-pref-eaj2")?.checked === true,
    eaj3: document.getElementById("push-pref-eaj3")?.checked === true,
    systemUpdates: document.getElementById("push-pref-system")?.checked === true
  };
}

function writePushPreferencesForm(prefs = EMPTY_PUSH_PREFS) {
  const map = [
    ["push-pref-eaj1", prefs.eaj1],
    ["push-pref-eaj2", prefs.eaj2],
    ["push-pref-eaj3", prefs.eaj3],
    ["push-pref-system", prefs.systemUpdates]
  ];
  map.forEach(([id, checked]) => {
    const el = document.getElementById(id);
    if (el) el.checked = checked === true;
  });
}

function hasAnyPushPreference(prefs) {
  return !!(prefs?.eaj1 || prefs?.eaj2 || prefs?.eaj3 || prefs?.systemUpdates);
}

function describePushPreferences(prefs) {
  const labels = [];
  if (prefs?.eaj1) labels.push("EAJ1");
  if (prefs?.eaj2) labels.push("EAJ2");
  if (prefs?.eaj3) labels.push("EAJ3");
  if (prefs?.systemUpdates) labels.push("mises à jour système");
  return labels.join(", ");
}

async function fetchCurrentPushPreferences(subscription) {
  if (!subscription || !window.EAJPlanning?.getPushPreferences) return { ...EMPTY_PUSH_PREFS };
  try {
    return await window.EAJPlanning.getPushPreferences(subscription.endpoint);
  } catch (error) {
    console.warn("Préférences Push indisponibles :", error);
    return { ...EMPTY_PUSH_PREFS };
  }
}

async function refreshPushMenuUi() {
  const btn = document.getElementById("push-menu-button");
  if (!btn) return;

  const statusEl = document.getElementById("push-menu-status");

  if (!pushIsSupported() || !getPushPublicKeyConfigured()) {
    btn.hidden = true;
    if (statusEl) statusEl.hidden = true;
    return;
  }

  btn.hidden = false;
  if (statusEl) statusEl.hidden = false;
  btn.disabled = false;

  if (Notification.permission === "denied") {
    btn.textContent = "🔕 Notifications bloquées";
    setPushMenuStatus("Autorisation refusée dans les réglages du navigateur.", "error");
    return;
  }

  try {
    const subscription = await getCurrentPushSubscription();
    if (subscription) {
      btn.textContent = "🔔 Gérer les notifications";
      const prefs = await fetchCurrentPushPreferences(subscription);
      const selected = describePushPreferences(prefs);
      setPushMenuStatus(
        selected
          ? `Actives : ${selected}. Les messages importants restent toujours inclus.`
          : "Notifications actives : messages importants uniquement. Ouvre les réglages pour choisir tes groupes.",
        "ok"
      );
    } else {
      btn.textContent = "🔔 Activer les notifications";
      setPushMenuStatus("Choisis EAJ1, EAJ2, EAJ3 et/ou les mises à jour système.");
    }
  } catch (error) {
    console.warn("Impossible de lire l'état des notifications :", error);
    btn.textContent = "🔔 Activer les notifications";
    setPushMenuStatus("État des notifications indisponible pour le moment.", "warn");
  }
}

async function enablePushNotifications(preferences) {
  const publicKey = getPushPublicKeyConfigured();
  if (!publicKey) throw new Error("La clé publique VAPID n'est pas encore configurée.");
  if (!hasAnyPushPreference(preferences)) throw new Error("Coche au moins une catégorie de notification.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    if (permission === "denied") {
      throw new Error("Les notifications ont été refusées. Il faut les autoriser dans les réglages du navigateur.");
    }
    return false;
  }

  const registration = await getPushServiceWorkerRegistration();
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(publicKey)
    });
  }

  try {
    await window.EAJPlanning.savePushSubscription(subscription, preferences);
  } catch (error) {
    try { await subscription.unsubscribe(); } catch (e) {}
    throw error;
  }

  return true;
}

async function disablePushNotifications() {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) return true;

  try {
    if (window.EAJPlanning?.removePushSubscription) {
      await window.EAJPlanning.removePushSubscription(subscription.endpoint);
    }
  } finally {
    await subscription.unsubscribe();
  }

  return true;
}

async function openPushPreferences() {
  if (!pushIsSupported() || !getPushPublicKeyConfigured()) return;
  openModalById("push-preferences-modal");
  setPushPreferencesStatus("Chargement des préférences…");

  try {
    const subscription = await getCurrentPushSubscription();
    const prefs = subscription ? await fetchCurrentPushPreferences(subscription) : { ...EMPTY_PUSH_PREFS };
    writePushPreferencesForm(prefs);
    const disableBtn = document.getElementById("push-disable-all");
    if (disableBtn) disableBtn.hidden = !subscription;
    setPushPreferencesStatus(
      subscription
        ? "Modifie tes choix puis enregistre. EAJ2/EAJ3 reçoivent automatiquement les messages EAJ 2-3."
        : "Coche au moins une case puis enregistre pour activer les notifications."
    );
  } catch (error) {
    console.error(error);
    setPushPreferencesStatus("Impossible de charger les préférences.", "error");
  }
}

async function savePushPreferencesFromModal() {
  const btn = document.getElementById("push-save-preferences");
  const prefs = readPushPreferencesForm();

  if (!hasAnyPushPreference(prefs)) {
    const subscription = await getCurrentPushSubscription();
    if (!subscription) {
      setPushPreferencesStatus("Coche au moins une case pour activer les notifications.", "warn");
      return;
    }
    const ok = window.confirm("Aucune catégorie n'est cochée. Désactiver complètement les notifications sur cet appareil ?");
    if (!ok) return;
    await disablePushNotifications();
    setPushPreferencesStatus("Notifications désactivées sur cet appareil.", "ok");
    const disableBtn = document.getElementById("push-disable-all");
    if (disableBtn) disableBtn.hidden = true;
    await refreshPushMenuUi();
    return;
  }

  try {
    if (btn) btn.disabled = true;
    setPushPreferencesStatus("Enregistrement…");
    let subscription = await getCurrentPushSubscription();
    if (!subscription) {
      const enabled = await enablePushNotifications(prefs);
      if (!enabled) return;
      subscription = await getCurrentPushSubscription();
    } else {
      await window.EAJPlanning.savePushSubscription(subscription, prefs);
    }

    const selected = describePushPreferences(prefs);
    setPushPreferencesStatus(`Enregistré : ${selected}. Messages importants toujours inclus.`, "ok");
    const disableBtn = document.getElementById("push-disable-all");
    if (disableBtn) disableBtn.hidden = false;
    await refreshPushMenuUi();
  } catch (error) {
    console.error("Erreur préférences push :", error);
    const message = error?.message || String(error);
    setPushPreferencesStatus(message, "error");
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function disableAllPushFromModal() {
  const ok = window.confirm("Désactiver toutes les notifications EAJ sur cet appareil ?");
  if (!ok) return;
  try {
    await disablePushNotifications();
    writePushPreferencesForm(EMPTY_PUSH_PREFS);
    setPushPreferencesStatus("Toutes les notifications sont désactivées.", "ok");
    const btn = document.getElementById("push-disable-all");
    if (btn) btn.hidden = true;
    await refreshPushMenuUi();
  } catch (error) {
    setPushPreferencesStatus(error?.message || String(error), "error");
  }
}

function initialiserPushPreferencesModal() {
  const saveBtn = document.getElementById("push-save-preferences");
  const disableBtn = document.getElementById("push-disable-all");
  if (saveBtn) saveBtn.addEventListener("click", savePushPreferencesFromModal);
  if (disableBtn) disableBtn.addEventListener("click", disableAllPushFromModal);
}

async function initialiserPushNotifications() {
  if (!document.getElementById("push-menu-button")) return;
  initialiserPushPreferencesModal();
  await refreshPushMenuUi();
}

/* ---------- Init globale ---------- */

async function initApp() {
  if (window.EAJPlanning && typeof window.EAJPlanning.loadPublicPlanning === "function") {
    await window.EAJPlanning.loadPublicPlanning();
  }

  syncGroupFilterButtons();
  initialiserFiltreActivite();
  renderToutesLesSemaines();

  // Toggle bannières d'abord, pour que le premier renderAlert (appelé par initialiserFiltres)
  // respecte l'état "Afficher bannières".
  initialiserBannerToggle();

  // Filtre (lit localStorage) + rend la bannière filtrée au bon groupe dès l'initialisation.
  initialiserFiltres();

  initialiserThemeToggle();
  renderLastUpdate();
  initialiserOfflineMode();

  initialiserMenu();
  initialiserInfoJournal();
  primeInfoJournalCache();
  initialiserModales();
  initialiserCloseOnScroll();
  initialiserContactCopy();
  initialiserClothesExchange();
  initialiserProjectsMenu();
  await initialiserPushNotifications();

  initialiserBackToTop();
  initialiserAdminModal();
  initialiserRealtimePlanning();
}

initApp().catch((error) => {
  console.error("Erreur d'initialisation du site EAJ :", error);
  syncGroupFilterButtons();
  initialiserFiltreActivite();
  renderToutesLesSemaines();
  initialiserBannerToggle();
  initialiserFiltres();
  initialiserThemeToggle();
  renderLastUpdate();
  initialiserOfflineMode();
  initialiserMenu();
  initialiserInfoJournal();
  primeInfoJournalCache();
  initialiserModales();
  initialiserCloseOnScroll();
  initialiserContactCopy();
  initialiserClothesExchange();
  initialiserProjectsMenu();
  initialiserPushNotifications().catch((pushError) => console.warn("Notifications push indisponibles :", pushError));
  initialiserBackToTop();
  initialiserAdminModal();
});
