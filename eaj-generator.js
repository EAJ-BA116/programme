// ===============================
//  Constantes et utilitaires
// ===============================

// Même définition que côté site public
const TYPES_ACTIVITE_DEFINITION = {
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

const TYPES_ACTIVITE_CHOICES = [
  { value: "bia",            label: "📘 Cours BIA" },
  { value: "sport",          label: "🏃‍♂️ Sport" },
  { value: "visite",         label: "🏛️ Visite" },
  { value: "projet",         label: "🛠️ Projet" },
  { value: "aeromodelisme",  label: "✈️ Aéromodélisme" },
  { value: "drone",          label: "🛸 Drone" },
  { value: "tir",            label: "🎯 Tir" },
  { value: "rencontres",     label: "🤝 Rencontres" },
  { value: "devoirMemoire",  label: "🕯️ Devoir de mémoire" },
  { value: "ceremonie",      label: "🎖️ Cérémonie" },
  { value: "autre",          label: "✨ Autres" }
];

const GROUPS = [
  { id: "EAJ1",  label: "Groupe 1 – EAJ1" },
  { id: "EAJ23", label: "Groupe 2-3 – EAJ 2-3" },
  { id: "EAJ2",  label: "Groupe 2 – EAJ2" },
  { id: "EAJ3",  label: "Groupe 3 – EAJ3" }
];

const EAJ23_MODES = {
  merged:   { label: "EAJ 2-3 ensemble", groups: ["EAJ23"] },
  EAJ2:     { label: "EAJ2 seul", groups: ["EAJ2"] },
  EAJ3:     { label: "EAJ3 seul", groups: ["EAJ3"] },
  separate: { label: "EAJ2 et EAJ3 séparés", groups: ["EAJ2", "EAJ3"] }
};

function isEaj23MergeEnabled() {
  const cb = document.getElementById("setting-merge-eaj23");
  return cb ? cb.checked : true;
}

function getDefaultEaj23Mode() {
  return isEaj23MergeEnabled() ? "merged" : "separate";
}

function getWeekEaj23Mode(weekDiv) {
  const select = weekDiv?.querySelector(".week-eaj23-mode");
  const value = select?.value || getDefaultEaj23Mode();
  return EAJ23_MODES[value] ? value : getDefaultEaj23Mode();
}

function getGroupMetaById(groupId) {
  return GROUPS.find(g => g.id === groupId) || { id: groupId, label: groupId || "Groupe" };
}

function getStoredGroupId(group) {
  if (!group || typeof group.titre !== "string") return "";
  if (Array.isArray(group.groupIds) && group.groupIds.includes("EAJ2") && group.groupIds.includes("EAJ3")) return "EAJ23";
  const title = group.titre.replace(/\s+/g, " ");
  if (title.includes("EAJ 2-3") || title.includes("EAJ2-3") || title.includes("EAJ 2 / 3")) return "EAJ23";
  if (title.includes("EAJ1")) return "EAJ1";
  if (title.includes("EAJ2")) return "EAJ2";
  if (title.includes("EAJ3")) return "EAJ3";
  return "";
}

function inferWeekEaj23Mode(weekObj) {
  if (weekObj && EAJ23_MODES[weekObj.eaj23Mode]) return weekObj.eaj23Mode;
  const ids = new Set((weekObj?.groupes || []).map(getStoredGroupId).filter(Boolean));
  if (ids.has("EAJ23")) return "merged";
  if (ids.has("EAJ2") && ids.has("EAJ3")) return "separate";
  if (ids.has("EAJ2")) return "EAJ2";
  if (ids.has("EAJ3")) return "EAJ3";
  return getDefaultEaj23Mode();
}

function updateWeekGroupModeUi(weekDiv) {
  if (!weekDiv) return;
  const mode = getWeekEaj23Mode(weekDiv);
  const modeField = weekDiv.querySelector(".week-eaj23-mode-field");
  if (modeField) modeField.style.display = "";

  weekDiv.querySelectorAll(".group-form").forEach(groupDiv => {
    const gid = groupDiv.dataset.group;
    let visible = gid === "EAJ1";
    if (gid !== "EAJ1") {
      visible = EAJ23_MODES[mode]?.groups.includes(gid) || false;
    }
    groupDiv.style.display = visible ? "" : "none";
  });
}

function updateAllWeekGroupModeUi() {
  document.querySelectorAll(".week-form").forEach(updateWeekGroupModeUi);
}

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];

let weekCounter = 0;

// Références DOM globales
const weeksContainer = document.getElementById("weeks-container");
const btnAddWeek     = document.getElementById("btn-add-week");
const btnGenerate    = document.getElementById("btn-generate");
const btnSave        = document.getElementById("btn-save");
const btnExport      = document.getElementById("btn-export");
const output         = document.getElementById("output");
const saveStatus     = document.getElementById("save-status");
const saveStatusTop  = document.getElementById("save-status-top");

const maintenanceUnlockInput = document.getElementById("maintenance-unlock-input");
const btnMaintenanceUnlock   = document.getElementById("btn-maintenance-unlock");
const maintenanceLocked      = document.getElementById("maintenance-locked");
const maintenanceTools       = document.getElementById("maintenance-tools");
const backupList             = document.getElementById("backup-list");
const backupLabel            = document.getElementById("backup-label");
const backupNote             = document.getElementById("backup-note");
const btnCreateBackup        = document.getElementById("btn-create-backup");
const btnRefreshBackups      = document.getElementById("btn-refresh-backups");
const btnResetDb             = document.getElementById("btn-reset-db");
const resetConfirmPhrase     = document.getElementById("reset-confirm-phrase");
const resetConfirmCode       = document.getElementById("reset-confirm-code");
const resetCodeDisplay       = document.getElementById("reset-code-display");
const maintenanceStatus      = document.getElementById("maintenance-status");

const authPanel      = document.getElementById("auth-panel");
const authForm       = document.getElementById("auth-form");
const authEmail      = document.getElementById("auth-email");
const authPassword   = document.getElementById("auth-password");
const authStatus     = document.getElementById("auth-status");
const authLogout     = document.getElementById("auth-logout");
const generatorIntro = document.getElementById("generator-intro");
const generatorApp   = document.getElementById("generator-app");
const settingMergeEaj23 = document.getElementById("setting-merge-eaj23");

// Notifications push
const pushAudience         = document.getElementById("push-audience");
const pushAudienceNote     = document.getElementById("push-audience-note");
const pushKind             = document.getElementById("push-kind");
const pushTitle            = document.getElementById("push-title");
const pushBody             = document.getElementById("push-body");
const pushUrl              = document.getElementById("push-url");
const btnSendPush          = document.getElementById("btn-send-push");
const btnRefreshPush       = document.getElementById("btn-refresh-push");
const pushSubscriberCount  = document.getElementById("push-subscriber-count");
const pushSubscriberBreakdown = document.getElementById("push-subscriber-breakdown");
const pushAdminStatus      = document.getElementById("push-admin-status");
const pushHistory          = document.getElementById("push-history");

// Navigation Super Admin simplifiée
const adminTabButtons      = Array.from(document.querySelectorAll("[data-admin-view]"));
const adminViewPanels      = Array.from(document.querySelectorAll("[data-admin-panel]"));
const btnAdminLogoutMain   = document.getElementById("btn-admin-logout-main");

// Bannières (multi)
const bannersContainer = document.getElementById("banners-container");
const btnAddBanner     = document.getElementById("btn-add-banner");


// ===============================
//  Accès Supabase admin
// ===============================

function setAuthStatus(message, type = "info") {
  if (!authStatus) return;
  authStatus.textContent = message || "";
  authStatus.classList.remove("ok", "error", "info");
  if (type) authStatus.classList.add(type);
}

function ensureToastNode() {
  let node = document.getElementById("generator-toast");
  if (!node) {
    node = document.createElement("div");
    node.id = "generator-toast";
    node.className = "generator-toast hidden";
    document.body.appendChild(node);
  }
  return node;
}

let toastTimer = null;
function showToast(message, type = "info") {
  const node = ensureToastNode();
  node.textContent = message || "";
  node.className = `generator-toast ${type || "info"}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.add("hidden"), type === "error" ? 6500 : 4200);
}

function setSaveStatus(message, type = "info", toast = false) {
  [saveStatus, saveStatusTop].forEach(node => {
    if (!node) return;
    node.textContent = message || "";
    node.classList.remove("ok", "error", "info");
    if (type) node.classList.add(type);
  });
  if (toast && message) showToast(message, type);
}

function setMaintenanceStatus(message, type = "info", toast = false) {
  if (maintenanceStatus) {
    maintenanceStatus.textContent = message || "";
    maintenanceStatus.classList.remove("ok", "error", "info");
    if (type) maintenanceStatus.classList.add(type);
  }
  if (toast && message) showToast(message, type);
}

function setButtonLoading(button, isLoading, loadingLabel) {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingLabel || "Traitement...";
    button.disabled = true;
    button.classList.add("is-loading");
  } else {
    if (button.dataset.originalText) button.textContent = button.dataset.originalText;
    button.disabled = false;
    button.classList.remove("is-loading");
  }
}

function showGenerator() {
  if (authPanel) authPanel.classList.add("hidden");
  if (generatorIntro) generatorIntro.classList.remove("hidden");
  if (generatorApp) generatorApp.classList.remove("hidden");
}

function hideGenerator() {
  if (authPanel) authPanel.classList.remove("hidden");
  if (generatorIntro) generatorIntro.classList.add("hidden");
  if (generatorApp) generatorApp.classList.add("hidden");
}

async function verifierAccesAdmin() {
  hideGenerator();

  if (!window.EAJPlanning || !window.EAJPlanning.isConfigured()) {
    setAuthStatus("Supabase n'est pas encore configuré dans supabase-config.js. Le générateur reste verrouillé.", "error");
    return false;
  }

  try {
    const status = await window.EAJPlanning.getAdminStatus();

    if (status.ok) {
      const nom = status.admin?.display_name || status.session?.user?.email || "admin";
      setAuthStatus(`Connecté : ${nom}`, "ok");
      if (authLogout) authLogout.classList.remove("hidden");
      showGenerator();
      return true;
    }

    if (status.reason === "not_admin") {
      setAuthStatus("Compte connecté, mais non autorisé à modifier ce planning.", "error");
      if (authLogout) authLogout.classList.remove("hidden");
      return false;
    }

    setAuthStatus("Connecte-toi avec le compte administrateur Supabase.", "info");
    if (authLogout) authLogout.classList.add("hidden");
    return false;
  } catch (error) {
    setAuthStatus("Erreur de vérification admin : " + (error.message || error), "error");
    return false;
  }
}

function initialiserAuthForm(onAdminReady) {
  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = (authEmail?.value || "").trim();
      const password = authPassword?.value || "";

      if (!email || !password) {
        setAuthStatus("Indique l'email et le mot de passe.", "error");
        return;
      }

      try {
        setAuthStatus("Connexion en cours...", "info");
        await window.EAJPlanning.signIn(email, password);
        const ok = await verifierAccesAdmin();
        if (ok && typeof onAdminReady === "function") await onAdminReady();
      } catch (error) {
        setAuthStatus("Connexion impossible : " + (error.message || error), "error");
      }
    });
  }

  if (authLogout) {
    authLogout.addEventListener("click", async () => {
      try {
        await window.EAJPlanning.signOut();
      } catch (e) {}
      location.reload();
    });
  }
}

function getPlanningDataForGenerator() {
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

  return { semaines, alertBanners, alertBanner, lastUpdate, settings, source: "planning.js", version: null };
}

async function chargerPlanningInitial() {
  if (window.EAJPlanning && window.EAJPlanning.isConfigured()) {
    try {
      setSaveStatus("Chargement du planning Supabase...", "info");
      const data = await window.EAJPlanning.fetchPlanningFromSupabase();
      setSaveStatus(`Planning chargé depuis Supabase${data.version ? " — version " + data.version : ""}.`, "ok");
      return data;
    } catch (error) {
      setSaveStatus("Supabase inaccessible : chargement du planning.js de secours. " + (error.message || error), "error");
    }
  }

  return getPlanningDataForGenerator();
}

async function sauvegarderDansSupabase() {
  const weeks = getWeeksData();
  const { ALERT_BANNER, ALERT_BANNERS, LAST_UPDATE, SETTINGS } = getConfigData();

  if (!weeks.length) {
    setSaveStatus("Aucune semaine valide. Ajoute au moins une date JJ/MM/AAAA correcte.", "error", true);
    alert("Aucune semaine valide. Ajoute au moins une date JJ/MM/AAAA correcte.");
    return;
  }

  if (!window.EAJPlanning || !window.EAJPlanning.isConfigured()) {
    setSaveStatus("Supabase n'est pas configuré : impossible d'enregistrer en ligne.", "error", true);
    return;
  }

  try {
    setButtonLoading(btnSave, true, "⏳ Enregistrement...");
    setSaveStatus("Création de la sauvegarde automatique...", "info");
    await window.EAJPlanning.createBackup("Sauvegarde automatique avant publication", { backupType: "automatic" });

    setSaveStatus("Sauvegarde créée ✅ Publication dans Supabase...", "info");
    const saved = await window.EAJPlanning.savePlanning({
      semaines: weeks,
      alertBanners: ALERT_BANNERS,
      alertBanner: ALERT_BANNER,
      lastUpdate: LAST_UPDATE,
      settings: SETTINGS,
      updatedByName: LAST_UPDATE.auteur
    });

    setSaveStatus(`Sauvegarde automatique créée • Planning publié ✅ Version ${saved.version || "?"}.`, "ok", true);
    updateOutput();
  } catch (error) {
    setSaveStatus("Erreur d'enregistrement : " + (error.message || error), "error", true);
    alert("Erreur d'enregistrement Supabase : " + (error.message || error));
  } finally {
    setButtonLoading(btnSave, false);
  }
}

// ===============================
//  Utilitaires dates
// ===============================

function getTodayFrDate() {
  const d = new Date();
  const jj = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${jj}/${mm}/${yyyy}`;
}

function formatDateFrValue(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 4) {
    return digits.slice(0, 2) + "/" + digits.slice(2);
  } else {
    return (
      digits.slice(0, 2) +
      "/" +
      digits.slice(2, 4) +
      "/" +
      digits.slice(4, 8)
    );
  }
}

function parseDateFr(str) {
  const clean = (str || "").trim();
  if (!clean) return null;

  const norm = clean.replace(/-/g, "/");
  const parts = norm.split("/");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (
    isNaN(day) || isNaN(month) || isNaN(year) ||
    day < 1 || day > 31 || month < 1 || month > 12 || year < 1900
  ) {
    return null;
  }

  const d = new Date(year, month - 1, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }

  const iso =
    year.toString().padStart(4, "0") +
    "-" +
    month.toString().padStart(2, "0") +
    "-" +
    day.toString().padStart(2, "0");

  const label = `${day} ${MOIS_FR[month - 1]} ${year}`;
  return { iso, label };
}

function getTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function compareIsoForGenerator(aIso, bIso) {
  const todayIso = getTodayIso();
  const aValid = typeof aIso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(aIso);
  const bValid = typeof bIso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(bIso);

  if (aValid && bValid) {
    const aFuture = aIso >= todayIso;
    const bFuture = bIso >= todayIso;
    if (aFuture !== bFuture) return aFuture ? -1 : 1;
    // À venir : plus proche en premier. Passées : plus récente en premier.
    return aFuture ? aIso.localeCompare(bIso) : bIso.localeCompare(aIso);
  }
  if (aValid && !bValid) return -1;
  if (!aValid && bValid) return 1;
  return 0;
}

function sortWeeksForGenerator(weeks) {
  return [...(Array.isArray(weeks) ? weeks : [])].sort((a, b) => compareIsoForGenerator(a?.isoDate, b?.isoDate));
}

function getWeekFormIso(form) {
  const raw = form.querySelector(".week-date-fr")?.value.trim() || "";
  const parsed = parseDateFr(raw);
  return parsed ? parsed.iso : null;
}

function normaliserDateFrPourInput(value, useTodayIfEmpty = false) {
  const raw = String(value || "").trim();
  if (!raw) return useTodayIfEmpty ? getTodayFrDate() : "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return isoToFrDate(raw);
  const parsed = parseDateFr(raw);
  return parsed ? isoToFrDate(parsed.iso) : raw;
}

// ===============================
//  Bannières (multi)
// ===============================

const BANNER_EMOJI_OPTIONS = [
  { value: "⚠️", label: "⚠️ Attention" },
  { value: "ℹ️", label: "ℹ️ Information" },
  { value: "✅", label: "✅ Confirmation" },
  { value: "📢", label: "📢 Annonce" },
  { value: "🚫", label: "🚫 Important" }
];

// On déduit le type de bannière depuis l’emoji choisi.
// L’utilisateur choisit "Attention/Information/Confirmation/Annonce/Important"
// via l’emoji, et le style/couleur s’aligne automatiquement.
const BANNER_TYPE_FROM_EMOJI = {
  "⚠️": "attention",
  "ℹ️": "information",
  "✅": "confirmation",
  "📢": "annonce",
  "🚫": "important"
};

function bannerTypeFromEmoji(emoji) {
  return BANNER_TYPE_FROM_EMOJI[emoji] || "annonce";
}

function createBannerItem(initial = {}) {
  if (!bannersContainer) return null;

  const div = document.createElement("div");
  div.className = "banner-item";

  const emojiSelect = document.createElement("select");
  emojiSelect.className = "banner-item-emoji";
  BANNER_EMOJI_OPTIONS.forEach(opt => {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    emojiSelect.appendChild(o);
  });
  emojiSelect.value = initial.emoji || "⚠️";

  const actifWrap = document.createElement("label");
  actifWrap.style.display = "inline-flex";
  actifWrap.style.gap = "0.35rem";
  actifWrap.style.alignItems = "center";
  const actif = document.createElement("input");
  actif.type = "checkbox";
  actif.className = "banner-item-actif";
  actif.checked = (initial.actif !== false);
  const actifTxt = document.createElement("span");
  actifTxt.textContent = "Actif";
  actifWrap.appendChild(actif);
  actifWrap.appendChild(actifTxt);

  const btnRemove = document.createElement("button");
  btnRemove.type = "button";
  btnRemove.className = "btn btn-small btn-danger";
  btnRemove.textContent = "🗑️ Supprimer";

  const row1 = document.createElement("div");
  row1.className = "banner-row";
  row1.appendChild(emojiSelect);
  row1.appendChild(actifWrap);
  row1.appendChild(btnRemove);

  const targets = document.createElement("div");
  targets.className = "banner-targets";

  function mkTarget(id, label, cls) {
    const lab = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = id;
    cb.className = cls;
    lab.appendChild(cb);
    lab.appendChild(document.createTextNode(label));
    return { lab, cb };
  }

  const tAll = mkTarget("all", "Tous", "banner-target-all");
  const t1 = mkTarget("EAJ1", "EAJ1", "banner-target");
  const t2 = mkTarget("EAJ2", "EAJ2", "banner-target");
  const t3 = mkTarget("EAJ3", "EAJ3", "banner-target");

  targets.appendChild(document.createTextNode("Cibles :"));
  targets.appendChild(tAll.lab);
  targets.appendChild(t1.lab);
  targets.appendChild(t2.lab);
  targets.appendChild(t3.lab);

  const row2 = document.createElement("div");
  row2.className = "banner-row";
  row2.appendChild(targets);

  // Dates (programmation)
  const startInput = document.createElement("input");
  startInput.type = "text";
  startInput.className = "banner-item-start";
  startInput.placeholder = "Début (JJ/MM/AAAA)";
  startInput.value = (String(initial.startDate || initial.dateDebut || initial.debut || "").trim() || getTodayFrDate());
  attachDateFrBehavior(startInput);

  const endInput = document.createElement("input");
  endInput.type = "text";
  endInput.className = "banner-item-end";
  endInput.placeholder = "Fin (optionnel)";
  endInput.value = String(initial.endDate || initial.dateFin || initial.fin || "").trim();
  attachDateFrBehavior(endInput);

  const rowDates = document.createElement("div");
  rowDates.className = "banner-row banner-dates-row";

  const lbl = document.createElement("span");
  lbl.className = "banner-dates-label";
  lbl.textContent = "Dates :";
  rowDates.appendChild(lbl);

  function mkDateField(labelTxt, inputEl) {
    const wrap = document.createElement("label");
    wrap.className = "banner-date-field";
    const t = document.createElement("span");
    t.textContent = labelTxt;
    wrap.appendChild(t);
    wrap.appendChild(inputEl);
    return wrap;
  }
  rowDates.appendChild(mkDateField("Début", startInput));
  rowDates.appendChild(mkDateField("Fin", endInput));

  const textarea = document.createElement("textarea");
  textarea.className = "banner-item-text banner-textarea";
  textarea.placeholder = "Message…";
  textarea.value = initial.texte || "";

  div.appendChild(row1);
  div.appendChild(row2);
  div.appendChild(rowDates);
  div.appendChild(textarea);

  // Valeurs initiales cibles
  const cibles = Array.isArray(initial.cibles) ? initial.cibles : (Array.isArray(initial.cible) ? initial.cible : []);
  if (!cibles.length || cibles.includes("all")) {
    tAll.cb.checked = true;
  } else {
    t1.cb.checked = cibles.includes("EAJ1");
    t2.cb.checked = cibles.includes("EAJ2");
    t3.cb.checked = cibles.includes("EAJ3");
  }

  // Si "Tous" coche → on désactive les autres (et inversement)
  function syncTargets() {
    const allChecked = tAll.cb.checked;
    [t1.cb, t2.cb, t3.cb].forEach(cb => {
      cb.disabled = allChecked;
      if (allChecked) cb.checked = false;
    });
  }
  tAll.cb.addEventListener("change", syncTargets);
  [t1.cb, t2.cb, t3.cb].forEach(cb => cb.addEventListener("change", () => {
    if (cb.checked) {
      tAll.cb.checked = false;
    }
    syncTargets();
  }));
  syncTargets();

  // Réactivité : dès qu’on change quelque chose → mise à jour du code
  [emojiSelect, actif, startInput, endInput, textarea, tAll.cb, t1.cb, t2.cb, t3.cb].forEach(el => {
    el.addEventListener("input", updateOutput);
    el.addEventListener("change", updateOutput);
  });

  btnRemove.addEventListener("click", () => {
    div.remove();
    // Toujours garder au moins 1 bannière (si l’utilisateur supprime tout)
    if (bannersContainer && !bannersContainer.querySelector(".banner-item")) {
      createBannerItem({
        actif: true,
        emoji: "⚠️",
        texte: "",
        cibles: ["all"]
      });
    }
    updateOutput();
  });

  bannersContainer.appendChild(div);
  return div;
}

function getBannersDataFromForm() {
  const globalActif = document.getElementById("banner-actif")?.checked ?? false;
  const items = Array.from(document.querySelectorAll(".banner-item")).map(item => {
    const actif = item.querySelector(".banner-item-actif")?.checked ?? true;
    const emoji = item.querySelector(".banner-item-emoji")?.value || "⚠️";
    const texte = (item.querySelector(".banner-item-text")?.value || "").trim();

    const allChecked = item.querySelector(".banner-target-all")?.checked ?? false;
    const checkedTargets = Array.from(item.querySelectorAll(".banner-target:checked")).map(cb => cb.value);
    const cibles = allChecked ? ["all"] : (checkedTargets.length ? checkedTargets : ["all"]);

    const startDateRaw = (item.querySelector(".banner-item-start")?.value || "").trim();
    const endDateRaw   = (item.querySelector(".banner-item-end")?.value || "").trim();
    const startDate = startDateRaw || getTodayFrDate();

    const obj = {
      actif: globalActif && actif,
      emoji,
      type: bannerTypeFromEmoji(emoji),
      texte,
      cibles,
      startDate
    };
    if (endDateRaw) obj.endDate = endDateRaw;
    return obj;
  });

  // On garde aussi les bannières vides (pour que l’utilisateur puisse juste préparer),
  // mais côté site public elles ne s’afficheront pas.
  return { globalActif, ALERT_BANNERS: items };
}

function setBannersInFormFromData(bannersArray, globalActif = true) {
  const bannerActifInput = document.getElementById("banner-actif");
  if (bannerActifInput) bannerActifInput.checked = !!globalActif;

  if (bannersContainer) bannersContainer.innerHTML = "";

  const arr = Array.isArray(bannersArray) ? bannersArray : [];
  if (!arr.length) {
    createBannerItem({ actif: true, emoji: "⚠️", texte: "", cibles: ["all"], startDate: getTodayFrDate(), endDate: "" });
    return;
  }

  arr.forEach(b => {
    createBannerItem({
      actif: b.actif !== false,
      emoji: b.emoji || "⚠️",
      texte: b.texte || "",
      cibles: Array.isArray(b.cibles) ? b.cibles : ["all"],
      startDate: (function(v){
        const s = String(v || "").trim();
        return /^\d{4}-\d{2}-\d{2}$/.test(s) ? isoToFrDate(s) : s;
      })(b.startDate || b.dateDebut || b.debut || ""),
      endDate: (function(v){
        const s = String(v || "").trim();
        return /^\d{4}-\d{2}-\d{2}$/.test(s) ? isoToFrDate(s) : s;
      })(b.endDate || b.dateFin || b.fin || "")
    });
  });
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

function attachDateFrBehavior(dateFrInput) {
  if (!dateFrInput) return;
  dateFrInput.addEventListener("input", (e) => {
    e.target.value = formatDateFrValue(e.target.value);
  });
}

// ===============================
//  Helpers HTML pour la preview
// ===============================

function buildInfoBlock(label, value) {
  if (!value) return "";
  return `
    <p class="label">${label}</p>
    <p class="value">${value}</p>
  `;
}

function buildTagLine(encadrant, tag) {
  const tags = [];
  if (encadrant) tags.push(`<span class="tag">Encadrant : ${encadrant}</span>`);
  if (tag)       tags.push(`<span class="tag">${tag}</span>`);
  if (!tags.length) return "";
  return `<div class="tag-line">${tags.join("")}</div>`;
}

function createActivityChip(activity, groupDefaults = {}) {
  const typeCfg = TYPES_ACTIVITE_DEFINITION[activity.type] || {
    label: "Autre",
    emoji: "✨",
    color: "#64748b"
  };

  const baseColor = typeCfg.color;
  const isTricolore = activity.cartoucheStyle === "tricolore";
  const bgColor = isTricolore
    ? "linear-gradient(105deg, rgba(0,85,164,.30) 0%, rgba(0,85,164,.20) 30%, rgba(255,255,255,.92) 50%, rgba(239,65,53,.20) 70%, rgba(239,65,53,.30) 100%)"
    : (baseColor.length === 7 ? baseColor + "25" : baseColor);

  const extras = [];
  // Les champs généraux du groupe sont affichés sous la carte.
  // Ici, on affiche uniquement les infos vraiment spécifiques à CETTE activité,
  // pour éviter les doublons du type "Tenue de vol" répété sur chaque activité.
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

  let html = `${typeCfg.emoji} <strong>${typeCfg.label}</strong> – ${activity.texte}`;
  if (extras.length > 0) {
    html += `<br><small>${extras.join(" • ")}</small>`;
  }

  return `
    <div class="activity-chip${isTricolore ? " activity-chip-tricolore" : ""}" style="background:${bgColor};border-left:4px solid ${isTricolore ? "#0055a4" : baseColor};${isTricolore ? "border-right:4px solid #ef4135;color:#0f2742;" : ""}">
      <span>${html}</span>
    </div>
  `;
}


function getActivityListSafe(list) {
  return Array.isArray(list) ? list.filter(a => a && String(a.texte || "").trim()) : [];
}

function hasMeaningfulCommonEntry(entry) {
  if (!entry) return false;
  if (getActivityListSafe(entry.activites).length > 0) return true;
  return Boolean(
    String(entry.horaire || "").trim() ||
    String(entry.lieu || "").trim() ||
    String(entry.tenue || "").trim() ||
    String(entry.materiel || "").trim() ||
    String(entry.encadrant || "").trim() ||
    String(entry.tag || "").trim()
  );
}

function hasMeaningfulGroupEntry(group) {
  if (!group) return false;
  if (getActivityListSafe(group.activites).length > 0) return true;
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

function buildActivitiesHtml(activities, defaults = {}) {
  const list = getActivityListSafe(activities);
  if (!list.length) return "";
  return `
    <p class="label">Activités :</p>
    <div class="activities-list">
      ${list.map(a => createActivityChip(a, defaults)).join("")}
    </div>
  `;
}

// ===============================
//  Lignes d’activité (formulaire)
// ===============================

function createActivityRow() {
  const row = document.createElement("div");
  row.className = "activity-row";

  const topLine = document.createElement("div");
  topLine.style.display = "grid";
  topLine.style.gridTemplateColumns = "130px minmax(0,1fr) auto";
  topLine.style.gap = "0.3rem";
  topLine.style.alignItems = "center";

  const select = document.createElement("select");
  TYPES_ACTIVITE_CHOICES.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.value;
    opt.textContent = t.label;
    select.appendChild(opt);
  });

  const inputTexte = document.createElement("input");
  inputTexte.type = "text";
  inputTexte.className = "act-texte";  // ⬅⬅ IMPORTANT
  inputTexte.placeholder = "Texte de l'activité (ex : Cours BIA : météo)";

  const btnRemove = document.createElement("button");
  btnRemove.type = "button";
  btnRemove.className = "btn btn-small btn-danger";
  btnRemove.textContent = "✖";
  btnRemove.addEventListener("click", () => row.remove());

  topLine.appendChild(select);
  topLine.appendChild(inputTexte);
  topLine.appendChild(btnRemove);

  const extra = document.createElement("div");
  extra.className = "activity-extra";
  extra.innerHTML = `
    <input type="text" class="act-horaire"  placeholder="Horaire spécifique (facultatif)" />
    <input type="text" class="act-lieu"     placeholder="Lieu spécifique (facultatif)" />
    <input type="text" class="act-tenue"    placeholder="Tenue spécifique (facultatif)" />
    <input type="text" class="act-materiel" placeholder="Matériel spécifique (facultatif)" />
    <input type="text" class="act-encadrant"placeholder="Encadrant spécifique (facultatif)" />
  `;

  const styleRow = document.createElement("div");
  styleRow.className = "activity-style-row";
  const styleLabel = document.createElement("label");
  styleLabel.textContent = "Style du cartouche";
  const styleSelect = document.createElement("select");
  styleSelect.className = "activity-style-select act-cartouche-style";
  [
    { value: "standard", label: "Standard" },
    { value: "tricolore", label: "🇫🇷 Bleu – Blanc – Rouge" }
  ].forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.value;
    opt.textContent = item.label;
    styleSelect.appendChild(opt);
  });
  styleRow.appendChild(styleLabel);
  styleRow.appendChild(styleSelect);

  row.appendChild(topLine);
  row.appendChild(extra);
  row.appendChild(styleRow);
  return row;
}


// ===============================
//  Formulaires groupes & communs
// ===============================

function createGroupForm(groupId, label) {
  const wrapper = document.createElement("div");
  wrapper.className = "group-form";
  wrapper.dataset.group = groupId;

  wrapper.innerHTML = `
    <div class="group-header">
      <div class="group-title">${label}</div>
      <div class="group-toggle">
        <label>
          <input type="checkbox" class="group-enabled" checked />
          Inclure ce groupe
        </label>
      </div>
    </div>
    <div class="group-fields">
      <div class="field">
        <label>Lieu</label>
        <input type="text" class="group-lieu" placeholder="Ex : Salle de cours / hangar..." />
      </div>
      <div class="field">
        <label>Horaire</label>
        <input type="text" class="group-horaire" placeholder="Ex : 13h45–17h00 (facultatif)" />
      </div>
      <div class="field">
        <label>Tenue</label>
        <input type="text" class="group-tenue" placeholder="Ex : Tenue de sport, tenue correcte..." />
      </div>
      <div class="field">
        <label>Matériel à apporter</label>
        <input type="text" class="group-materiel" placeholder="Ex : Gourde, trousse, carnet..." />
      </div>
      <div class="field">
        <label>Encadrant</label>
        <input type="text" class="group-encadrant" placeholder="Ex : Sgt Dupont, CNE Durand..." />
      </div>
      <div class="field">
        <label>Tag (résumé)</label>
        <input type="text" class="group-tag" placeholder="Ex : BIA, Cohésion, Projet..." />
      </div>
      <div class="activities-block">
        <div class="activities-header">
          <span>Activités</span>
          <button type="button" class="btn btn-small btn-primary btn-add-activity">➕ Ajouter une activité</button>
        </div>
        <div class="activities-list"></div>
      </div>
    </div>
  `;

  const activitiesList = wrapper.querySelector(".activities-list");
  const btnAddActivity = wrapper.querySelector(".btn-add-activity");

  activitiesList.appendChild(createActivityRow());
  btnAddActivity.addEventListener("click", () => {
    activitiesList.appendChild(createActivityRow());
  });

  return wrapper;
}

function createCommonForm() {
  const wrapper = document.createElement("div");
  wrapper.className = "common-form";

  wrapper.innerHTML = `
    <div class="common-header">
      <div class="common-title-inner">Activité commune</div>
      <button type="button" class="btn btn-small btn-danger btn-remove-common">Supprimer</button>
    </div>
    <div class="common-groups">
      <label><input type="checkbox" class="common-group-checkbox" value="EAJ1" checked /> EAJ1</label>
      <label><input type="checkbox" class="common-group-checkbox" value="EAJ2" checked /> EAJ2</label>
      <label><input type="checkbox" class="common-group-checkbox" value="EAJ3" checked /> EAJ3</label>
      <span>(décoche les groupes non concernés)</span>
    </div>
    <div class="group-fields">
      <div class="field">
        <label>Lieu</label>
        <input type="text" class="common-lieu" placeholder="Ex : Salle de sport / monument..." />
      </div>
      <div class="field">
        <label>Horaire</label>
        <input type="text" class="common-horaire" placeholder="Ex : 13h45–17h00 (facultatif)" />
      </div>
      <div class="field">
        <label>Tenue</label>
        <input type="text" class="common-tenue" placeholder="Ex : Tenue correcte..." />
      </div>
      <div class="field">
        <label>Matériel à apporter</label>
        <input type="text" class="common-materiel" placeholder="Ex : Gourde, parapluie..." />
      </div>
      <div class="field">
        <label>Encadrant</label>
        <input type="text" class="common-encadrant" placeholder="Ex : Équipe EAJ, Sgt Dupont..." />
      </div>
      <div class="field">
        <label>Tag (résumé)</label>
        <input type="text" class="common-tag" placeholder="Ex : Activité commune, Devoir de mémoire..." />
      </div>
      <div class="activities-block">
        <div class="activities-header">
          <span>Activités</span>
          <button type="button" class="btn btn-small btn-primary btn-add-activity-common">➕ Ajouter une activité</button>
        </div>
        <div class="activities-list-common"></div>
      </div>
    </div>
  `;

  const activitiesList = wrapper.querySelector(".activities-list-common");
  const btnAddActivity = wrapper.querySelector(".btn-add-activity-common");
  const btnRemoveCommon = wrapper.querySelector(".btn-remove-common");

  activitiesList.appendChild(createActivityRow());
  btnAddActivity.addEventListener("click", () => {
    activitiesList.appendChild(createActivityRow());
  });

  btnRemoveCommon.addEventListener("click", () => {
    if (confirm("Supprimer cette activité commune ?")) {
      wrapper.remove();
      updateOutput();
    }
  });

  return wrapper;
}

// ===============================
//  Semaine : formulaire + preview
// ===============================

function renderWeekPreview(weekObj) {
  const isOff = weekObj.statut === "off";

  let html = `
    <section class="week">
      <div class="week-header">
        <div>
          <div class="week-title">${weekObj.date}</div>
          <div class="week-note">${weekObj.note || ""}</div>
        </div>
      </div>
  `;

  if (isOff) {
    html += `
      <div class="week-off">
        <div class="week-off-emoji">🛑</div>
        <div class="week-off-title">Pas de séance EAJ</div>
        <p class="week-off-text">
          ${weekObj.messageOff || "Les activités reprendront la semaine suivante."}
        </p>
      </div>
    </section>`;
    return html;
  }

  // Activités communes
  const commonEntries = Array.isArray(weekObj.activitesCommunes)
    ? weekObj.activitesCommunes.filter(hasMeaningfulCommonEntry)
    : [];

  const presentGroups = new Set();
  commonEntries.forEach(entry => addCommonGroupsToSet(entry, presentGroups));

  if (commonEntries.length > 0) {
    commonEntries.forEach(entry => {
      const groupes = Array.isArray(entry.groupes) ? entry.groupes.filter(Boolean) : [];
      const groupesLabel = groupes.length
        ? "Groupes concernés : " + groupes.join(" + ")
        : "Tous les groupes";

      html += `
        <article class="group-card week-common-card">
          <div class="week-common-emoji">🤝</div>
          <div class="week-common-title">Activité commune</div>
          <div class="week-common-groups">${groupesLabel}</div>
          ${buildActivitiesHtml(entry.activites, entry)}
          ${buildInfoBlock("Horaire :", entry.horaire || "")}
          ${buildInfoBlock("Lieu :", entry.lieu || "")}
          ${buildInfoBlock("Tenue :", entry.tenue || "")}
          ${buildInfoBlock("Matériel à apporter :", entry.materiel || "")}
          ${buildTagLine(entry.encadrant || "", entry.tag || "Activité commune")}
        </article>
      `;
    });
  }

  // Groupes
  html += `<div class="groups">`;

  const meaningfulGroups = (weekObj.groupes || []).filter(g => g && g.titre && hasMeaningfulGroupEntry(g));

  meaningfulGroups.forEach(g => {
    const groupId = getStoredGroupId(g);

    if (groupId) {
      presentGroups.add(groupId);
      if (groupId === "EAJ23") {
        presentGroups.add("EAJ2");
        presentGroups.add("EAJ3");
      }
    }

    html += `
      <article class="group-card" data-group="${groupId}">
        <div class="group-title">${g.titre}</div>
        ${buildActivitiesHtml(g.activites, g)}
        ${buildInfoBlock("Horaire (général) :", g.horaire || "")}
        ${buildInfoBlock("Lieu (général) :", g.lieu || "")}
        ${buildInfoBlock("Tenue (générale) :", g.tenue || "")}
        ${buildInfoBlock("Matériel à apporter (général) :", g.materiel || "")}
        ${buildTagLine(g.encadrant || "", g.tag || "")}
      </article>
    `;
  });

  // Groupes absents
  const mode = EAJ23_MODES[weekObj.eaj23Mode] ? weekObj.eaj23Mode : getDefaultEaj23Mode();
  const secondary = mode === "merged"
    ? [{ id: "EAJ23", titre: "Groupe 2-3 – EAJ 2-3" }]
    : mode === "EAJ2"
      ? [{ id: "EAJ2", titre: "Groupe 2 – EAJ2" }]
      : mode === "EAJ3"
        ? [{ id: "EAJ3", titre: "Groupe 3 – EAJ3" }]
        : [
            { id: "EAJ2", titre: "Groupe 2 – EAJ2" },
            { id: "EAJ3", titre: "Groupe 3 – EAJ3" }
          ];
  const ALL_GROUPS = [{ id: "EAJ1", titre: "Groupe 1 – EAJ1" }, ...secondary];

  ALL_GROUPS.forEach(gMeta => {
    if (!presentGroups.has(gMeta.id)) {
      html += `
        <article class="group-card group-card-off" data-group="${gMeta.id}">
          <div class="group-title">${gMeta.titre}</div>
          <div class="group-off">
            <div class="group-off-emoji">🛑</div>
            <div class="group-off-title">Pas de séance ${gMeta.id}</div>
            <p class="group-off-text">
              Ce groupe n'est pas convoqué pour cette date.
            </p>
          </div>
        </article>
      `;
    }
  });

  html += `</div></section>`;
  return html;
}

function createWeekForm(options = {}) {
  weekCounter += 1;

  const weekDiv = document.createElement("div");
  weekDiv.className = "week-form";
  weekDiv.dataset.weekId = String(weekCounter);

  weekDiv.innerHTML = `
    <div class="week-header-row">
      <div class="week-title">Semaine n°${weekCounter}</div>
      <div style="display:flex; gap:0.4rem; align-items:center;">
        <button type="button" class="btn btn-small btn-secondary btn-edit-week" style="display:none;">Modifier</button>
        <button type="button" class="btn btn-small btn-primary btn-validate-week">Valider</button>
        <button type="button" class="btn btn-small btn-danger btn-remove-week">Supprimer</button>
      </div>
    </div>
    <div class="week-edit">
      <div class="week-fields">
        <div class="field">
          <label>Date (JJ/MM/AAAA)</label>
          <input type="text" class="week-date-fr" placeholder="Ex : 03/12/2025" />
        </div>
        <div class="field">
          <label>
            <input type="checkbox" class="week-session" checked />
            Séance EAJ (si décoché : semaine sans séance)
          </label>
        </div>
        <div class="field">
          <label>Note (petit texte sous la date)</label>
          <input type="text" class="week-note" placeholder="Ex : Prévoir une tenue chaude..." />
        </div>
        <div class="field">
          <label>Message si OFF (facultatif)</label>
          <textarea class="week-messageOff" placeholder="Ex : Pas de séance EAJ ce mercredi..."></textarea>
        </div>
        <div class="field week-eaj23-mode-field">
          <label>Organisation EAJ2 / EAJ3 pour cette semaine</label>
          <select class="week-eaj23-mode">
            <option value="merged">EAJ 2-3 ensemble</option>
            <option value="EAJ2">EAJ2 seul</option>
            <option value="EAJ3">EAJ3 seul</option>
            <option value="separate">EAJ2 et EAJ3 séparés</option>
          </select>
          <span class="note">Exception valable uniquement pour cette semaine.</span>
        </div>
      </div>
      <div class="groups-wrapper"></div>
      <div class="common-wrapper">
        <div class="common-header-row">
          <div class="common-title">Activités communes (facultatif)</div>
          <button type="button" class="btn btn-small btn-primary btn-add-common">➕ Ajouter une activité commune</button>
        </div>
        <div class="common-list"></div>
      </div>
    </div>
    <div class="week-preview" style="margin-top:0.6rem; display:none;"></div>
  `;

  const btnRemove = weekDiv.querySelector(".btn-remove-week");
  const btnValidate = weekDiv.querySelector(".btn-validate-week");
  const btnEdit = weekDiv.querySelector(".btn-edit-week");

  const dateFrInput = weekDiv.querySelector(".week-date-fr");
  const sessionCheckbox = weekDiv.querySelector(".week-session");
  const noteField = weekDiv.querySelector(".week-note").closest(".field");
  const messageOffField = weekDiv.querySelector(".week-messageOff").closest(".field");
  const eaj23ModeSelect = weekDiv.querySelector(".week-eaj23-mode");

  // Gestion séance / off
  function updateSessionFields() {
    const isSession = sessionCheckbox.checked;
    if (isSession) {
      noteField.style.display = "";
      messageOffField.style.display = "none";
    } else {
      noteField.style.display = "none";
      messageOffField.style.display = "";
    }
  }
  updateSessionFields();

  sessionCheckbox.addEventListener("change", updateSessionFields);
  attachDateFrBehavior(dateFrInput);

  // Affiche la date dans le titre dès la saisie (utile avant même de "Valider").
  dateFrInput.addEventListener("input", updateWeekTitlesWithDates);

  // Réorganisation automatique lorsque la date change, sans "perdre" la fiche :
  // on la remet à sa bonne place puis on la garde visible à l'écran.
  dateFrInput.addEventListener("change", () => reorderWeekFormsByDate(weekDiv));
  dateFrInput.addEventListener("blur", () => reorderWeekFormsByDate(weekDiv));


  // Groupes
  const groupsWrapper = weekDiv.querySelector(".groups-wrapper");
  GROUPS.forEach(g => {
    groupsWrapper.appendChild(createGroupForm(g.id, g.label));
  });

  if (eaj23ModeSelect) {
    eaj23ModeSelect.value = getDefaultEaj23Mode();
    eaj23ModeSelect.addEventListener("change", () => {
      updateWeekGroupModeUi(weekDiv);
      updateOutput();
    });
  }
  updateWeekGroupModeUi(weekDiv);

  // Activités communes
  const commonList = weekDiv.querySelector(".common-list");
  const btnAddCommon = weekDiv.querySelector(".btn-add-common");
  btnAddCommon.addEventListener("click", () => {
    commonList.appendChild(createCommonForm());
  });

  // Supprimer semaine
  btnRemove.addEventListener("click", () => {
    if (confirm("Supprimer cette semaine ?")) {
      weekDiv.remove();
      updateOutput();
      updateWeekTitlesWithDates();
    }
  });

  // Valider = basculer en mode preview
  btnValidate.addEventListener("click", () => {
    const weekData = getWeekDataFromForm(weekDiv, true);
    if (!weekData) return;

    const previewDiv = weekDiv.querySelector(".week-preview");
    previewDiv.innerHTML = renderWeekPreview(weekData);

    weekDiv.querySelector(".week-edit").style.display = "none";
    previewDiv.style.display = "block";

    btnValidate.style.display = "none";
    btnEdit.style.display = "inline-flex";

    // Met à jour le titre avec la date (ex : "Semaine n°2 — 10 février 2026").
    updateWeekTitlesWithDates();

    updateOutput();
  });

  // Modifier = revenir au formulaire
  btnEdit.addEventListener("click", () => {
    weekDiv.querySelector(".week-edit").style.display = "block";
    weekDiv.querySelector(".week-preview").style.display = "none";

    btnEdit.style.display = "none";
    btnValidate.style.display = "inline-flex";
  });

  if (options.prepend && weeksContainer.firstElementChild) {
    weeksContainer.insertBefore(weekDiv, weeksContainer.firstElementChild);
  } else {
    weeksContainer.appendChild(weekDiv);
  }

  updateWeekTitlesWithDates();

  if (options.focusDate) {
    setTimeout(() => {
      focusWeekForm(weekDiv);
      const input = weekDiv.querySelector(".week-date-fr");
      if (input) input.focus();
    }, 60);
  }

  return weekDiv;
}

// ===============================
//  Lecture du formulaire -> objet
// ===============================

function getWeekDataFromForm(weekDiv, showAlertOnError = false) {
  // -------- Date et statut --------
  const dateFrInput = weekDiv.querySelector(".week-date-fr");
  const dateFr = dateFrInput ? dateFrInput.value.trim() : "";
  const parsed = parseDateFr(dateFr);

  if (!parsed) {
    if (showAlertOnError) {
      alert("Date invalide ou manquante pour une semaine (JJ/MM/AAAA).");
    }
    return null;
  }

  const sessionCheckbox = weekDiv.querySelector(".week-session");
  const isSession = sessionCheckbox && sessionCheckbox.checked;

  const noteInput = weekDiv.querySelector(".week-note");
  const messageOffInput = weekDiv.querySelector(".week-messageOff");

  const eaj23Mode = getWeekEaj23Mode(weekDiv);
  const activeSecondaryGroups = new Set(EAJ23_MODES[eaj23Mode]?.groups || ["EAJ2", "EAJ3"]);

  const weekObj = {
    isoDate: parsed.iso,
    date: parsed.label,
    statut: isSession ? "session" : "off",
    note: isSession ? (noteInput?.value.trim() || "") : "",
    messageOff: !isSession ? (messageOffInput?.value.trim() || "") : "",
    eaj23Mode,
    activitesCommunes: [],
    groupes: []
  };

  // -------- Groupes (EAJ1 / EAJ 2-3 / exceptions EAJ2 / EAJ3) --------
  const groupForms = weekDiv.querySelectorAll(".group-form");
  groupForms.forEach(groupDiv => {
    const groupId = groupDiv.dataset.group;
    if (groupId !== "EAJ1" && !activeSecondaryGroups.has(groupId)) return;

    const enabled = groupDiv.querySelector(".group-enabled")?.checked;
    if (!enabled) return;

    const meta = getGroupMetaById(groupId);
    const titre = meta.label;

    const lieu      = groupDiv.querySelector(".group-lieu")?.value.trim()      || "";
    const horaire   = groupDiv.querySelector(".group-horaire")?.value.trim()   || "";
    const tenue     = groupDiv.querySelector(".group-tenue")?.value.trim()     || "";
    const materiel  = groupDiv.querySelector(".group-materiel")?.value.trim()  || "";
    const encadrant = groupDiv.querySelector(".group-encadrant")?.value.trim() || "";
    const tag       = groupDiv.querySelector(".group-tag")?.value.trim()       || "";

    const activitiesRows = groupDiv.querySelectorAll(".activity-row");
    const activites = [];

    activitiesRows.forEach(row => {
      const select = row.querySelector("select");
      const inputText = row.querySelector(".act-texte");   // ⬅ texte principal

      if (!select || !inputText) return;

      const type = select.value;
      const texte = inputText.value.trim();
      if (!texte) return;

      const actHoraire   = row.querySelector(".act-horaire")?.value.trim()   || "";
      const actLieu      = row.querySelector(".act-lieu")?.value.trim()      || "";
      const actTenue     = row.querySelector(".act-tenue")?.value.trim()     || "";
      const actMateriel  = row.querySelector(".act-materiel")?.value.trim()  || "";
      const actEncadrant = row.querySelector(".act-encadrant")?.value.trim() || "";
      const cartoucheStyle = row.querySelector(".act-cartouche-style")?.value || "standard";

      const act = { type, texte };
      if (cartoucheStyle !== "standard") act.cartoucheStyle = cartoucheStyle;
      if (actHoraire)   act.horaire  = actHoraire;
      if (actLieu)      act.lieu     = actLieu;
      if (actTenue)     act.tenue    = actTenue;
      if (actMateriel)  act.materiel = actMateriel;
      if (actEncadrant) act.encadrant= actEncadrant;

      activites.push(act);
    });

    // Si le groupe est coché mais vide, on ne l'enregistre pas.
    // Cela évite d'afficher sur le site des cartes "EAJ1/EAJ2/EAJ3" vides avec seulement "Activités :".
    if (
      activites.length === 0 &&
      !lieu && !horaire && !tenue && !materiel && !encadrant && !tag
    ) {
      return;
    }

    const groupObj = { titre, activites };
    if (groupId === "EAJ23") groupObj.groupIds = ["EAJ2", "EAJ3"];
    if (horaire)   groupObj.horaire   = horaire;
    if (lieu)      groupObj.lieu      = lieu;
    if (tenue)     groupObj.tenue     = tenue;
    if (materiel)  groupObj.materiel  = materiel;
    if (encadrant) groupObj.encadrant = encadrant;
    if (tag)       groupObj.tag       = tag;

    weekObj.groupes.push(groupObj);
  });

  // -------- Activités communes --------
  const commonForms = weekDiv.querySelectorAll(".common-form");
  commonForms.forEach(commonDiv => {
    const groupCheckboxes = commonDiv.querySelectorAll(".common-group-checkbox:checked");
    const groupes = [];
    groupCheckboxes.forEach(cb => {
      if (cb.value) groupes.push(cb.value);
    });

    const lieu      = commonDiv.querySelector(".common-lieu")?.value.trim()      || "";
    const horaire   = commonDiv.querySelector(".common-horaire")?.value.trim()   || "";
    const tenue     = commonDiv.querySelector(".common-tenue")?.value.trim()     || "";
    const materiel  = commonDiv.querySelector(".common-materiel")?.value.trim()  || "";
    const encadrant = commonDiv.querySelector(".common-encadrant")?.value.trim() || "";
    const tag       = commonDiv.querySelector(".common-tag")?.value.trim()       || "";

    const activitiesRows = commonDiv.querySelectorAll(".activity-row");
    const activites = [];

    activitiesRows.forEach(row => {
      const select = row.querySelector("select");
      const inputText = row.querySelector(".act-texte");   // ⬅ même classe

      if (!select || !inputText) return;

      const type = select.value;
      const texte = inputText.value.trim();
      if (!texte) return;

      const actHoraire   = row.querySelector(".act-horaire")?.value.trim()   || "";
      const actLieu      = row.querySelector(".act-lieu")?.value.trim()      || "";
      const actTenue     = row.querySelector(".act-tenue")?.value.trim()     || "";
      const actMateriel  = row.querySelector(".act-materiel")?.value.trim()  || "";
      const actEncadrant = row.querySelector(".act-encadrant")?.value.trim() || "";
      const cartoucheStyle = row.querySelector(".act-cartouche-style")?.value || "standard";

      const act = { type, texte };
      if (cartoucheStyle !== "standard") act.cartoucheStyle = cartoucheStyle;
      if (actHoraire)   act.horaire  = actHoraire;
      if (actLieu)      act.lieu     = actLieu;
      if (actTenue)     act.tenue    = actTenue;
      if (actMateriel)  act.materiel = actMateriel;
      if (actEncadrant) act.encadrant= actEncadrant;

      activites.push(act);
    });

    // Si vraiment rien de rempli, on n'ajoute pas l'entrée
    if (
      activites.length === 0 &&
      !lieu && !horaire && !tenue && !materiel && !encadrant && !tag
    ) {
      return;
    }

    const commonObj = { groupes, activites };
    if (horaire)   commonObj.horaire   = horaire;
    if (lieu)      commonObj.lieu      = lieu;
    if (tenue)     commonObj.tenue     = tenue;
    if (materiel)  commonObj.materiel  = materiel;
    if (encadrant) commonObj.encadrant = encadrant;
    if (tag)       commonObj.tag       = tag;

    weekObj.activitesCommunes.push(commonObj);
  });

  return weekObj;
}


// Récupérer toutes les semaines
function getWeeksData() {
  const weekForms = document.querySelectorAll(".week-form");
  const weeks = [];

  weekForms.forEach(weekDiv => {
    const week = getWeekDataFromForm(weekDiv, false);
    if (week) weeks.push(week);
  });

  // Dans le générateur : dates à venir d'abord, puis dates passées à la fin.
  return sortWeeksForGenerator(weeks);
}

// Met à jour les titres des semaines en incluant la date (si disponible).
// Objectif : dans la liste/preview du générateur, éviter l'effet "Semaine 1, Semaine 2" sans date.
function updateWeekTitlesWithDates() {
  const forms = Array.from(document.querySelectorAll(".week-form"));
  forms.forEach((form, i) => {
    const t = form.querySelector(".week-title");
    if (!t) return;

    const raw = form.querySelector(".week-date-fr")?.value.trim() || "";
    const parsed = parseDateFr(raw);
    const dateLabel = parsed ? parsed.label : "";

    t.textContent = dateLabel
      ? `Semaine n°${i + 1} — ${dateLabel}`
      : `Semaine n°${i + 1}`;
  });
}
function focusWeekForm(weekDiv) {
  if (!weekDiv) return;
  weekDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  weekDiv.classList.add("week-form-highlight");
  window.clearTimeout(weekDiv.__highlightTimer);
  weekDiv.__highlightTimer = window.setTimeout(() => {
    weekDiv.classList.remove("week-form-highlight");
  }, 1800);
}

// Réordonne les formulaires "semaine" par date (pour éviter l’effet "ajout en bas").
function reorderWeekFormsByDate(focusForm = null) {
  if (!weeksContainer) return;
  const items = Array.from(document.querySelectorAll(".week-form"));
  const keyed = items.map((el, idx) => {
    const v = el.querySelector(".week-date-fr")?.value.trim() || "";
    const p = parseDateFr(v);
    return { el, idx, iso: p ? p.iso : null };
  });

  keyed.sort((a, b) => {
    const byDate = compareIsoForGenerator(a.iso, b.iso);
    return byDate || (a.idx - b.idx);
  });

  keyed.forEach(k => weeksContainer.appendChild(k.el));

  // Renumérote + affiche la date (sans toucher aux IDs internes)
  updateWeekTitlesWithDates();

  if (focusForm) {
    setTimeout(() => focusWeekForm(focusForm), 60);
  }
}


// ===============================
//  Config générale + build JS
// ===============================

function getConfigData() {
  const { globalActif, ALERT_BANNERS } = getBannersDataFromForm();
  const auteur      = document.getElementById("lastupdate-auteur")?.value.trim() || "Yoann";
  const dateInput   = document.getElementById("lastupdate-date");

  // On lit la date affichée dans le champ ; si vide, on met la date du jour.
  let dateTexte = normaliserDateFrPourInput(dateInput?.value || "", true);
  if (dateInput && dateInput.value !== dateTexte) dateInput.value = dateTexte;

  // Compat : on garde un "ALERT_BANNER" simple (ancien format)
  // en concaténant les messages (utile si un ancien script ignore ALERT_BANNERS).
  const messagesNonVides = (ALERT_BANNERS || [])
    .filter(b => b && b.actif && String(b.texte || "").trim().length > 0)
    .map(b => `${b.emoji ? b.emoji + " " : ""}${String(b.texte).trim()}`);

  const ALERT_BANNER_CFG = {
    actif: !!globalActif,
    texte: messagesNonVides.join("\n")
  };

  const LAST_UPDATE_CFG = {
    auteur,
    dateTexte
  };

  const SETTINGS_CFG = {
    mergeEaj23: isEaj23MergeEnabled()
  };

  return {
    ALERT_BANNER: ALERT_BANNER_CFG,
    ALERT_BANNERS: Array.isArray(ALERT_BANNERS) ? ALERT_BANNERS : [],
    LAST_UPDATE: LAST_UPDATE_CFG,
    SETTINGS: SETTINGS_CFG
  };
}


function buildPlanningJs() {
  const weeks = getWeeksData();
  const { ALERT_BANNER, ALERT_BANNERS, LAST_UPDATE, SETTINGS } = getConfigData();

  if (weeks.length === 0) {
    return "// Aucune semaine valide (renseigner au moins une date JJ/MM/AAAA correcte).";
  }

  const parts = [];
  parts.push("// ⚠️ Bannières d’alerte (multi-cibles : all / EAJ1 / EAJ2 / EAJ3)");
  parts.push("const ALERT_BANNERS = " + JSON.stringify(ALERT_BANNERS, null, 2) + ";\n");
  parts.push("// ⚠️ Compat (ancien format) : concaténation des bannières");
  parts.push("const ALERT_BANNER = " + JSON.stringify(ALERT_BANNER, null, 2) + ";\n");
  parts.push("// 📝 Dernière mise à jour (affichée dans le footer)");
  parts.push("const LAST_UPDATE = " + JSON.stringify(LAST_UPDATE, null, 2) + ";\n");
  parts.push("// ⚙️ Réglages du planning");
  parts.push("const PLANNING_SETTINGS = " + JSON.stringify(SETTINGS, null, 2) + ";\n");
  parts.push("// 🗓️ LISTE DES SEMAINES / ÉVÉNEMENTS (isoDate au format AAAA-MM-JJ)");
  parts.push("const SEMAINES = " + JSON.stringify(weeks, null, 2) + ";\n");

  return parts.join("\n");
}

function updateOutput() {
  const js = buildPlanningJs();
  output.value = js;
  output.scrollTop = 0;
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/javascript" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ===============================
//  Rechargement depuis planning.js
// ===============================

function isoToFrDate(iso) {
  if (!iso || typeof iso !== "string") return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return "";
  const [yyyy, mm, dd] = parts;
  return `${dd}/${mm}/${yyyy}`;
}

function chargerPlanningExistant(sourceData) {
  const planningData = sourceData || getPlanningDataForGenerator();
  let semainesSource = Array.isArray(planningData.semaines) ? planningData.semaines : [];
  const alertBannersSource = Array.isArray(planningData.alertBanners) ? planningData.alertBanners : [];
  const alertBannerSource = planningData.alertBanner || { actif: false, texte: "" };
  const lastUpdateSource = planningData.lastUpdate || { auteur: "", dateTexte: "" };
  const settingsSource = planningData.settings || { mergeEaj23: true };

  if (!Array.isArray(semainesSource)) semainesSource = [];

  // Config générale : organisation des groupes + bannières + dernière MAJ
  const bannerActifInput   = document.getElementById("banner-actif");
  const lastUpdateAuteur   = document.getElementById("lastupdate-auteur");
  const lastUpdateDate     = document.getElementById("lastupdate-date");

  if (settingMergeEaj23) {
    settingMergeEaj23.checked = settingsSource.mergeEaj23 !== false;
  }

  // Nouveau format : ALERT_BANNERS (multi)
  if (Array.isArray(alertBannersSource) && alertBannersSource.length > 0) {
    const anyActive = alertBannersSource.some(b => b && b.actif);
    if (bannerActifInput) bannerActifInput.checked = anyActive;
    setBannersInFormFromData(alertBannersSource, anyActive);
  }
  // Ancien format : ALERT_BANNER (simple)
  else if (alertBannerSource) {
    const isOn = !!alertBannerSource.actif;
    if (bannerActifInput) bannerActifInput.checked = isOn;
    setBannersInFormFromData([
      {
        actif: isOn,
        emoji: "⚠️",
        texte: alertBannerSource.texte || "",
        cibles: ["all"]
      }
    ], isOn);
  }

  if (lastUpdateSource) {
    if (lastUpdateAuteur && lastUpdateSource.auteur)  lastUpdateAuteur.value  = lastUpdateSource.auteur;
    if (lastUpdateDate) lastUpdateDate.value = normaliserDateFrPourInput(lastUpdateSource.dateTexte || "", true);
  } else if (lastUpdateDate) {
    lastUpdateDate.value = getTodayFrDate();
  }

  // On vide d’abord tout éventuel contenu existant
  weeksContainer.innerHTML = "";
  weekCounter = 0;

  if (semainesSource.length === 0) {
    updateOutput();
    return false;
  }

  // On trie comme le site : prochaines dates d'abord, passées à la fin.
  const weeksSorted = sortWeeksForGenerator(semainesSource);

  weeksSorted.forEach(weekObj => {
    const weekDiv = createWeekForm();
    weekDiv.dataset.loadedExisting = "true";

    const eaj23ModeSelect = weekDiv.querySelector(".week-eaj23-mode");
    if (eaj23ModeSelect) eaj23ModeSelect.value = inferWeekEaj23Mode(weekObj);
    updateWeekGroupModeUi(weekDiv);

    // ---- Date + statut (session / off) ----
    const dateInput        = weekDiv.querySelector(".week-date-fr");
    const sessionCheckbox  = weekDiv.querySelector(".week-session");
    const noteInput        = weekDiv.querySelector(".week-note");
    const messageOffInput  = weekDiv.querySelector(".week-messageOff");

    if (dateInput) {
      if (weekObj.isoDate) {
        dateInput.value = isoToFrDate(weekObj.isoDate);
      } else {
        dateInput.value = "";
      }
    }

    const isSession = weekObj.statut !== "off";
    if (sessionCheckbox) {
      sessionCheckbox.checked = isSession;
      // déclenche l’update des champs (note / messageOff)
      sessionCheckbox.dispatchEvent(new Event("change"));
    }

    if (isSession && noteInput) {
      noteInput.value = weekObj.note || "";
    }
    if (!isSession && messageOffInput) {
      messageOffInput.value = weekObj.messageOff || "";
    }

    // ---- Groupes : on part de tous désactivés, puis on active ceux présents ----
    const groupForms = weekDiv.querySelectorAll(".group-form");
    const groupDivById = {};

    groupForms.forEach(groupDiv => {
      const enabledCb = groupDiv.querySelector(".group-enabled");
      if (enabledCb) enabledCb.checked = false;

      const gid = groupDiv.dataset.group;
      if (gid) groupDivById[gid] = groupDiv;

      // on nettoie tout
      groupDiv.querySelector(".group-lieu").value      = "";
      groupDiv.querySelector(".group-horaire").value   = "";
      groupDiv.querySelector(".group-tenue").value     = "";
      groupDiv.querySelector(".group-materiel").value  = "";
      groupDiv.querySelector(".group-encadrant").value = "";
      groupDiv.querySelector(".group-tag").value       = "";

      const list = groupDiv.querySelector(".activities-list");
      if (list) list.innerHTML = "";
    });

    if (Array.isArray(weekObj.groupes)) {
      weekObj.groupes.forEach(g => {
        if (!g || typeof g.titre !== "string") return;

        const groupId = getStoredGroupId(g);

        const groupDiv = groupDivById[groupId];
        if (!groupDiv) return;

        const enabledCb = groupDiv.querySelector(".group-enabled");
        if (enabledCb) enabledCb.checked = true;

        if (g.lieu)      groupDiv.querySelector(".group-lieu").value      = g.lieu;
        if (g.horaire)   groupDiv.querySelector(".group-horaire").value   = g.horaire;
        if (g.tenue)     groupDiv.querySelector(".group-tenue").value     = g.tenue;
        if (g.materiel)  groupDiv.querySelector(".group-materiel").value  = g.materiel;
        if (g.encadrant) groupDiv.querySelector(".group-encadrant").value = g.encadrant;
        if (g.tag)       groupDiv.querySelector(".group-tag").value       = g.tag;

        const list = groupDiv.querySelector(".activities-list");
        if (!list) return;

        (g.activites || []).forEach(act => {
          if (!act) return;
          const row = createActivityRow();
          const select = row.querySelector("select");
          const mainInput = row.querySelector('input[type="text"]');

          if (select && act.type)   select.value  = act.type;
          if (mainInput && act.texte) mainInput.value = act.texte;

          if (act.horaire)   row.querySelector(".act-horaire").value   = act.horaire;
          if (act.lieu)      row.querySelector(".act-lieu").value      = act.lieu;
          if (act.tenue)     row.querySelector(".act-tenue").value     = act.tenue;
          if (act.materiel)  row.querySelector(".act-materiel").value  = act.materiel;
          if (act.encadrant) row.querySelector(".act-encadrant").value = act.encadrant;
          const styleSelect = row.querySelector(".act-cartouche-style");
          if (styleSelect) styleSelect.value = act.cartoucheStyle === "tricolore" ? "tricolore" : "standard";

          list.appendChild(row);
        });
      });
    }

    // ---- Activités communes ----
    const commonList = weekDiv.querySelector(".common-list");
    if (commonList && Array.isArray(weekObj.activitesCommunes)) {
      weekObj.activitesCommunes.forEach(entry => {
        if (!entry) return;
        const commonDiv = createCommonForm();

        // Groupes concernés
        const groupes = Array.isArray(entry.groupes) ? entry.groupes : [];
        const cbs = commonDiv.querySelectorAll(".common-group-checkbox");
        if (groupes.length > 0) {
          cbs.forEach(cb => {
            cb.checked = groupes.includes(cb.value);
          });
        }

        if (entry.lieu)      commonDiv.querySelector(".common-lieu").value      = entry.lieu;
        if (entry.horaire)   commonDiv.querySelector(".common-horaire").value   = entry.horaire;
        if (entry.tenue)     commonDiv.querySelector(".common-tenue").value     = entry.tenue;
        if (entry.materiel)  commonDiv.querySelector(".common-materiel").value  = entry.materiel;
        if (entry.encadrant) commonDiv.querySelector(".common-encadrant").value = entry.encadrant;
        if (entry.tag)       commonDiv.querySelector(".common-tag").value       = entry.tag;

        const list = commonDiv.querySelector(".activities-list-common");
        (entry.activites || []).forEach(act => {
          if (!act) return;
          const row = createActivityRow();
          const select = row.querySelector("select");
          const mainInput = row.querySelector('input[type="text"]');

          if (select && act.type)    select.value    = act.type;
          if (mainInput && act.texte) mainInput.value = act.texte;

          if (act.horaire)   row.querySelector(".act-horaire").value   = act.horaire;
          if (act.lieu)      row.querySelector(".act-lieu").value      = act.lieu;
          if (act.tenue)     row.querySelector(".act-tenue").value     = act.tenue;
          if (act.materiel)  row.querySelector(".act-materiel").value  = act.materiel;
          if (act.encadrant) row.querySelector(".act-encadrant").value = act.encadrant;
          const styleSelect = row.querySelector(".act-cartouche-style");
          if (styleSelect) styleSelect.value = act.cartoucheStyle === "tricolore" ? "tricolore" : "standard";

          list.appendChild(row);
        });

        commonList.appendChild(commonDiv);
      });
    }

    updateWeekGroupModeUi(weekDiv);

    // ---- On bascule directement en mode "aperçu" pour cette semaine ----
    const btnValidate = weekDiv.querySelector(".btn-validate-week");
    if (btnValidate) {
      btnValidate.click(); // utilise le même flux que l’utilisateur
    }
  });

  // Met à jour le bloc de sortie JS
  updateOutput();
  return true;
}

// ===============================
//  Notifications push — Super Admin
// ===============================

let pushLastAudience = "all_eaj";

function setPushAdminStatus(message = "", type = "info") {
  if (!pushAdminStatus) return;
  pushAdminStatus.textContent = message;
  pushAdminStatus.classList.remove("ok", "error", "info");
  if (type) pushAdminStatus.classList.add(type);
}

function getPushKindLabel(kind) {
  const labels = {
    information: "ℹ️ Information",
    programme: "📅 Programme / activité",
    modification: "🔄 Modification",
    cancellation: "❌ Annulation",
    document: "📄 Document / consigne",
    update: "🆕 Mise à jour application",
    important: "🚨 Important"
  };
  return labels[kind] || labels.information;
}

function getPushAudienceLabel(audience) {
  const labels = {
    all_active: "Tous les abonnés actifs",
    all_eaj: "Tous les EAJ",
    eaj1: "EAJ1",
    eaj2: "EAJ2 uniquement",
    eaj3: "EAJ3 uniquement",
    eaj23: "EAJ 2-3",
    system: "Mises à jour système"
  };
  return labels[audience] || labels.all_eaj;
}

function syncPushAudienceRules() {
  if (!pushKind || !pushAudience) return;
  const kind = pushKind.value;

  if (!pushAudience.disabled && pushAudience.value !== "all_active") {
    pushLastAudience = pushAudience.value;
  }

  if (kind === "important") {
    pushAudience.value = "all_active";
    pushAudience.disabled = true;
    if (pushAudienceNote) pushAudienceNote.textContent = "Un message important est envoyé à tous les appareils ayant activé les notifications, sans tenir compte des préférences.";
    return;
  }

  if (kind === "update") {
    pushAudience.value = "system";
    pushAudience.disabled = true;
    if (pushAudienceNote) pushAudienceNote.textContent = "Une mise à jour de l’application est envoyée uniquement aux personnes ayant coché « Mises à jour système ».";
    return;
  }

  pushAudience.disabled = false;
  if (pushAudience.value === "all_active" || (pushAudience.value === "system" && pushLastAudience !== "system")) {
    pushAudience.value = pushLastAudience || "all_eaj";
  }
  if (pushAudienceNote) pushAudienceNote.textContent = "EAJ2 et EAJ3 peuvent recevoir séparément ou ensemble via EAJ 2-3.";
}

function renderPushHistory(items) {
  if (!pushHistory) return;
  pushHistory.innerHTML = "";

  if (!Array.isArray(items) || !items.length) {
    const empty = document.createElement("div");
    empty.className = "note";
    empty.textContent = "Aucune notification envoyée pour le moment.";
    pushHistory.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "push-history-item";
    card.dataset.notificationId = item.id || "";

    const head = document.createElement("div");
    head.className = "push-history-head";

    const title = document.createElement("span");
    title.className = "push-history-title";
    title.textContent = `${getPushKindLabel(item.kind)} — ${item.title || "Sans titre"}`;

    const headRight = document.createElement("div");
    headRight.className = "push-history-head-actions";

    const counts = document.createElement("span");
    counts.className = "push-history-counts";
    counts.textContent = `✅ ${item.sent_count || 0}  •  ❌ ${item.failed_count || 0}`;
    headRight.appendChild(counts);

    if (item.id) {
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn-push-delete";
      deleteBtn.textContent = "🗑️ Supprimer";
      deleteBtn.title = "Supprimer ce message de l’historique et des Dernières informations";
      deleteBtn.addEventListener("click", async () => {
        const ok = confirm(`Supprimer définitivement ce message ?\n\n${item.title || "Sans titre"}\n\nIl disparaîtra aussi du journal « Dernières informations ». `);
        if (!ok) return;

        try {
          deleteBtn.disabled = true;
          deleteBtn.textContent = "⏳ Suppression...";
          setPushAdminStatus("Suppression du message en cours...", "info");

          if (!window.EAJPlanning || typeof window.EAJPlanning.deletePushNotification !== "function") {
            throw new Error("Migration v1.8.2 ou module de suppression manquant.");
          }

          await window.EAJPlanning.deletePushNotification(item.id);
          setPushAdminStatus("Message supprimé.", "ok");
          await rafraichirPushAdmin();
        } catch (error) {
          console.error("Erreur suppression notification :", error);
          deleteBtn.disabled = false;
          deleteBtn.textContent = "🗑️ Supprimer";
          setPushAdminStatus(`Suppression impossible : ${error?.message || error}`, "error");
        }
      });
      headRight.appendChild(deleteBtn);
    }

    head.append(title, headRight);

    const body = document.createElement("div");
    body.className = "push-history-body";
    body.textContent = item.body || "";

    const meta = document.createElement("div");
    meta.className = "push-history-meta";
    const date = item.created_at ? new Date(item.created_at).toLocaleString("fr-FR") : "date inconnue";
    const statusLabels = { pending: "En attente", sent: "Envoyée", partial: "Partielle", failed: "Échec" };
    const statusLabel = item.status ? (statusLabels[item.status] || item.status) : "";
    const audienceLabel = getPushAudienceLabel(item.audience || (item.kind === "important" ? "all_active" : "all_eaj"));
    meta.textContent = `${date} — ${audienceLabel}${item.created_by_name ? " — " + item.created_by_name : ""}${statusLabel ? " — " + statusLabel : ""}`;

    card.append(head, body, meta);
    pushHistory.appendChild(card);
  });
}

async function rafraichirPushAdmin() {
  if (!pushSubscriberCount || !pushHistory) return;

  if (!window.EAJPlanning || !window.EAJPlanning.isConfigured()) {
    pushSubscriberCount.textContent = "Appareils inscrits : indisponible";
    setPushAdminStatus("Supabase n'est pas configuré.", "error");
    return;
  }

  if (
    typeof window.EAJPlanning.getPushSubscriberStats !== "function" ||
    typeof window.EAJPlanning.listPushNotifications !== "function"
  ) {
    setPushAdminStatus("Module push v1.7.x absent de planning-api.js.", "error");
    return;
  }

  try {
    setButtonLoading(btnRefreshPush, true, "⏳");
    const [stats, history] = await Promise.all([
      window.EAJPlanning.getPushSubscriberStats(),
      window.EAJPlanning.listPushNotifications(10)
    ]);
    pushSubscriberCount.textContent = `Appareils actifs : ${stats.total || 0}`;
    if (pushSubscriberBreakdown) {
      pushSubscriberBreakdown.textContent = `EAJ1 : ${stats.eaj1 || 0} • EAJ2 : ${stats.eaj2 || 0} • EAJ3 : ${stats.eaj3 || 0} • EAJ 2-3 : ${stats.eaj23 || 0} • Mises à jour système : ${stats.system || 0}`;
    }
    renderPushHistory(history);

    const publicKey = typeof window.EAJPlanning.getPushPublicKey === "function"
      ? window.EAJPlanning.getPushPublicKey()
      : "";

    if (!publicKey) {
      setPushAdminStatus("Base Push prête, mais la clé publique VAPID n'est pas encore renseignée dans supabase-config.js.", "info");
    } else {
      setPushAdminStatus("Centre de notifications prêt.", "ok");
    }
  } catch (error) {
    console.error("Erreur chargement notifications push :", error);
    pushSubscriberCount.textContent = "Appareils inscrits : ?";
    if (pushSubscriberBreakdown) pushSubscriberBreakdown.textContent = "";
    renderPushHistory([]);
    setPushAdminStatus(
      "Notifications v1.7.x non initialisées. Exécute la migration v1.7.0 puis redéploie la fonction Edge send-eaj-push.",
      "error"
    );
  } finally {
    setButtonLoading(btnRefreshPush, false);
  }
}

async function envoyerNotificationPush() {
  const kind = pushKind?.value || "information";
  const audience = kind === "important" ? "all_active" : (kind === "update" ? "system" : (pushAudience?.value || "all_eaj"));
  const title = (pushTitle?.value || "").trim();
  const body = (pushBody?.value || "").trim();
  const url = (pushUrl?.value || "index.html").trim() || "index.html";

  if (!title || !body) {
    setPushAdminStatus("Renseigne un titre et un message.", "error");
    return;
  }

  const audienceLabel = getPushAudienceLabel(audience);
  const ok = confirm(`Envoyer cette notification ?\n\nDestinataires : ${audienceLabel}\nCatégorie : ${getPushKindLabel(kind)}\n\n${title}\n${body}`);
  if (!ok) return;

  try {
    setButtonLoading(btnSendPush, true, "⏳ Envoi...");
    setPushAdminStatus("Envoi de la notification en cours...", "info");

    const result = await window.EAJPlanning.sendPushNotification({
      kind,
      audience,
      title,
      body,
      url
    });

    const sent = Number(result?.sent || 0);
    const failed = Number(result?.failed || 0);
    const matched = Number(result?.matched || 0);

    setPushAdminStatus(
      `Cible : ${matched} appareil${matched > 1 ? "s" : ""} • envoyée : ${sent}${failed ? ` • échecs : ${failed}` : ""}.`,
      failed ? "info" : "ok"
    );

    if (pushBody) pushBody.value = "";
    await rafraichirPushAdmin();
  } catch (error) {
    console.error("Erreur envoi push :", error);
    const message = error?.message || String(error);
    setPushAdminStatus(`Envoi impossible : ${message}`, "error");
    alert(`Notification non envoyée : ${message}`);
  } finally {
    setButtonLoading(btnSendPush, false);
  }
}

function initialiserPushAdmin() {
  if (!btnSendPush) return;

  btnSendPush.addEventListener("click", envoyerNotificationPush);
  if (btnRefreshPush) btnRefreshPush.addEventListener("click", rafraichirPushAdmin);
  if (pushAudience) pushAudience.addEventListener("change", () => {
    if (!pushAudience.disabled && pushAudience.value !== "all_active") pushLastAudience = pushAudience.value;
  });

  if (pushKind) {
    pushKind.addEventListener("change", () => {
      syncPushAudienceRules();
      const currentTitle = (pushTitle?.value || "").trim();
      if (!pushTitle || (currentTitle && currentTitle !== "EAJ BA 116" && !currentTitle.startsWith("Mise à jour"))) return;

      if (pushKind.value === "update") {
        pushTitle.value = "Mise à jour EAJ BA 116";
      } else if (!currentTitle || currentTitle.startsWith("Mise à jour")) {
        pushTitle.value = "EAJ BA 116";
      }
    });
  }

  syncPushAudienceRules();
  rafraichirPushAdmin();
}

// ===============================
//  Maintenance : sauvegardes / remise à zéro
// ===============================

function getGeneratorAdminName() {
  const auteur = document.getElementById("lastupdate-auteur")?.value.trim();
  const email = authEmail?.value?.trim();
  return auteur || email || "Admin EAJ";
}

function refreshResetCode() {
  if (!resetCodeDisplay) return "";
  const code = String(Math.floor(1000 + Math.random() * 9000));
  resetCodeDisplay.textContent = code;
  resetCodeDisplay.dataset.code = code;
  return code;
}

function unlockMaintenance() {
  const value = (maintenanceUnlockInput?.value || "").trim().toUpperCase();
  if (value !== "MAINTENANCE") {
    setMaintenanceStatus("Code maintenance incorrect.", "error", true);
    return;
  }
  if (maintenanceLocked) maintenanceLocked.classList.add("hidden");
  if (maintenanceTools) maintenanceTools.classList.remove("hidden");
  refreshResetCode();
  setMaintenanceStatus("Zone maintenance déverrouillée. Prudence : les actions ici modifient directement Supabase.", "info");
  chargerListeSauvegardes();
}

async function chargerListeSauvegardes() {
  if (!backupList) return;
  if (!window.EAJPlanning || !window.EAJPlanning.isConfigured()) {
    setMaintenanceStatus("Supabase n'est pas configuré : sauvegardes indisponibles.", "error", true);
    return;
  }

  try {
    setButtonLoading(btnRefreshBackups, true, "⏳ Chargement...");
    setMaintenanceStatus("Chargement des sauvegardes...", "info");
    const backups = await window.EAJPlanning.listBackups(100);
    backupList.innerHTML = "";

    if (!backups.length) {
      backupList.innerHTML = '<div class="backup-empty">Aucune sauvegarde disponible pour l’instant.</div>';
      setMaintenanceStatus("Aucune sauvegarde trouvée pour l'instant.", "info");
      return;
    }

    backups.forEach(b => {
      const card = document.createElement("div");
      card.className = "backup-card";
      card.dataset.backupId = b.id;

      const info = document.createElement("div");
      const date = b.created_at ? new Date(b.created_at).toLocaleString("fr-FR") : "date inconnue";
      const version = b.source_version ? `v${b.source_version}` : "version ?";
      const type = b.backup_type || (String(b.reason || "").toLowerCase().includes("automatique") ? "automatic" : "manual");
      const badgeLabel = type === "manual" ? "Manuelle" : (type === "safety" ? "Sécurité" : "Automatique");
      const title = (b.label || "").trim() || b.reason || "Sauvegarde";
      const author = b.created_by_name ? ` • ${b.created_by_name}` : "";

      const titleEl = document.createElement("div");
      titleEl.className = "backup-card-title";
      titleEl.textContent = title;
      const badge = document.createElement("span");
      badge.className = "backup-badge";
      badge.textContent = badgeLabel;
      titleEl.appendChild(badge);

      const meta = document.createElement("div");
      meta.className = "backup-card-meta";
      meta.textContent = `${date} • ${version}${author}`;

      info.appendChild(titleEl);
      info.appendChild(meta);

      if (b.note) {
        const note = document.createElement("div");
        note.className = "backup-card-note";
        note.textContent = b.note;
        info.appendChild(note);
      } else if (b.label && b.reason && b.reason !== b.label) {
        const reason = document.createElement("div");
        reason.className = "backup-card-note";
        reason.textContent = b.reason;
        info.appendChild(reason);
      }

      const actions = document.createElement("div");
      actions.className = "backup-card-actions";

      const restoreBtn = document.createElement("button");
      restoreBtn.type = "button";
      restoreBtn.className = "btn btn-small btn-primary";
      restoreBtn.textContent = "↩️ Restaurer";
      restoreBtn.addEventListener("click", () => restaurerSauvegarde(b.id, title, restoreBtn));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-small btn-danger";
      deleteBtn.textContent = "🗑️ Supprimer";
      deleteBtn.addEventListener("click", () => supprimerSauvegarde(b.id, title, deleteBtn));

      actions.appendChild(restoreBtn);
      actions.appendChild(deleteBtn);
      card.appendChild(info);
      card.appendChild(actions);
      backupList.appendChild(card);
    });

    setMaintenanceStatus(`${backups.length} sauvegarde(s) chargée(s).`, "ok");
  } catch (error) {
    setMaintenanceStatus("Impossible de charger les sauvegardes : " + (error.message || error), "error", true);
  } finally {
    setButtonLoading(btnRefreshBackups, false);
  }
}

async function creerSauvegardeManuelle() {
  const label = (backupLabel?.value || "").trim();
  const note = (backupNote?.value || "").trim();
  if (!label) {
    setMaintenanceStatus("Donne un nom à la sauvegarde manuelle.", "error", true);
    backupLabel?.focus();
    return;
  }
  try {
    setButtonLoading(btnCreateBackup, true, "⏳ Sauvegarde...");
    setMaintenanceStatus("Création de la sauvegarde manuelle...", "info", true);
    await window.EAJPlanning.createBackup(label, {
      label,
      note,
      backupType: "manual"
    });
    if (backupLabel) backupLabel.value = "";
    if (backupNote) backupNote.value = "";
    setMaintenanceStatus("Sauvegarde manuelle créée ✅", "ok", true);
    await chargerListeSauvegardes();
  } catch (error) {
    setMaintenanceStatus("Impossible de créer la sauvegarde : " + (error.message || error), "error", true);
  } finally {
    setButtonLoading(btnCreateBackup, false);
  }
}

async function restaurerSauvegarde(backupId, title = "cette sauvegarde", button = null) {
  if (!backupId) return;
  const ok = confirm(`Restaurer « ${title} » ?

Une sauvegarde de sécurité de l'état actuel sera créée automatiquement avant la restauration.`);
  if (!ok) return;

  try {
    setButtonLoading(button, true, "⏳ Restauration...");
    setMaintenanceStatus("Sauvegarde de sécurité puis restauration en cours...", "info", true);
    const restored = await window.EAJPlanning.restoreBackup(backupId, {
      updatedByName: getGeneratorAdminName()
    });
    setSaveStatus(`Sauvegarde restaurée ✅ Version ${restored.version || "?"}.`, "ok", true);
    setMaintenanceStatus(`« ${title} » a été restaurée dans Supabase.`, "ok", true);
    const okLoad = chargerPlanningExistant(restored);
    if (!okLoad) {
      createWeekForm();
      updateOutput();
    }
    await chargerListeSauvegardes();
  } catch (error) {
    setMaintenanceStatus("Erreur de restauration : " + (error.message || error), "error", true);
    alert("Erreur de restauration : " + (error.message || error));
  } finally {
    setButtonLoading(button, false);
  }
}

async function supprimerSauvegarde(backupId, title = "cette sauvegarde", button = null) {
  if (!backupId) return;
  const ok = confirm(`Supprimer définitivement « ${title} » ?

Cette action ne modifie pas le planning actuel, mais la sauvegarde ne pourra plus être restaurée.`);
  if (!ok) return;
  try {
    setButtonLoading(button, true, "⏳ Suppression...");
    await window.EAJPlanning.deleteBackup(backupId);
    setMaintenanceStatus(`Sauvegarde « ${title} » supprimée.`, "ok", true);
    await chargerListeSauvegardes();
  } catch (error) {
    setMaintenanceStatus("Impossible de supprimer la sauvegarde : " + (error.message || error), "error", true);
  } finally {
    setButtonLoading(button, false);
  }
}

async function remettreBaseAZeroAvecSauvegarde() {
  const phrase = (resetConfirmPhrase?.value || "").trim().toUpperCase();
  const code = (resetConfirmCode?.value || "").trim();
  const expectedCode = resetCodeDisplay?.dataset.code || "";

  if (phrase !== "RINCER LA BASE" || !expectedCode || code !== expectedCode) {
    setMaintenanceStatus("Sécurité refusée : tape exactement RINCER LA BASE et recopie le code affiché.", "error", true);
    refreshResetCode();
    return;
  }

  const ok = confirm("Dernière confirmation : créer une sauvegarde automatique puis vider le planning Supabase ?");
  if (!ok) {
    refreshResetCode();
    return;
  }

  try {
    setButtonLoading(btnResetDb, true, "⏳ Remise à zéro...");
    setMaintenanceStatus("Sauvegarde automatique en cours, puis remise à zéro...", "info", true);

    const saved = await window.EAJPlanning.resetPlanningWithBackup({
      updatedByName: getGeneratorAdminName()
    });

    setSaveStatus(`Base remise à zéro ✅ Version ${saved.version || "?"}. Une sauvegarde automatique a été créée.`, "ok", true);
    setMaintenanceStatus("Remise à zéro terminée. Tu peux maintenant créer le nouveau programme.", "ok");

    const okLoad = chargerPlanningExistant(saved);
    if (!okLoad) {
      createWeekForm();
      updateOutput();
    }

    if (resetConfirmPhrase) resetConfirmPhrase.value = "";
    if (resetConfirmCode) resetConfirmCode.value = "";
    refreshResetCode();
    await chargerListeSauvegardes();
  } catch (error) {
    setMaintenanceStatus("Erreur pendant la remise à zéro : " + (error.message || error), "error", true);
    alert("Erreur pendant la remise à zéro : " + (error.message || error));
  } finally {
    setButtonLoading(btnResetDb, false);
  }
}


function initialiserMaintenance() {
  if (btnMaintenanceUnlock) btnMaintenanceUnlock.addEventListener("click", unlockMaintenance);
  if (maintenanceUnlockInput) {
    maintenanceUnlockInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        unlockMaintenance();
      }
    });
  }
  if (btnRefreshBackups) btnRefreshBackups.addEventListener("click", chargerListeSauvegardes);
  if (btnCreateBackup) btnCreateBackup.addEventListener("click", creerSauvegardeManuelle);
  if (btnResetDb) btnResetDb.addEventListener("click", remettreBaseAZeroAvecSauvegarde);
}

// ===============================
//  Navigation Super Admin simplifiée
// ===============================

function ouvrirVueAdmin(viewName = "planning", options = {}) {
  const allowed = new Set(["planning", "notifications", "settings"]);
  const target = allowed.has(viewName) ? viewName : "planning";

  adminTabButtons.forEach(btn => {
    const active = btn.dataset.adminView === target;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });

  adminViewPanels.forEach(panel => {
    panel.classList.toggle("active", panel.dataset.adminPanel === target);
  });

  try { localStorage.setItem("eaj-admin-view", target); } catch (e) {}

  if (target === "notifications" && typeof rafraichirPushAdmin === "function") {
    rafraichirPushAdmin();
  }

  if (options.scroll !== false) {
    const nav = document.querySelector(".admin-tabs");
    if (nav && nav.scrollIntoView) nav.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function initialiserNavigationAdmin() {
  adminTabButtons.forEach(btn => {
    btn.addEventListener("click", () => ouvrirVueAdmin(btn.dataset.adminView || "planning"));
  });

  if (btnAdminLogoutMain) {
    btnAdminLogoutMain.addEventListener("click", () => {
      if (authLogout) authLogout.click();
    });
  }

  let initialView = "planning";
  try {
    const saved = localStorage.getItem("eaj-admin-view");
    if (["planning", "notifications", "settings"].includes(saved)) initialView = saved;
  } catch (e) {}
  ouvrirVueAdmin(initialView, { scroll: false });
}

// ===============================
//  Initialisation globale
// ===============================

async function initGeneratorApp() {
  const lastUpdateInput = document.getElementById("lastupdate-date");
  const bannerActifInput = document.getElementById("banner-actif");

  initialiserNavigationAdmin();
  initialiserMaintenance();
  initialiserPushAdmin();

  // Permet de taper la date facilement (ex: 23012026 -> 23/01/2026)
  if (lastUpdateInput) {
    attachDateFrBehavior(lastUpdateInput);
    lastUpdateInput.addEventListener("input", updateOutput);
    lastUpdateInput.addEventListener("change", updateOutput);
    lastUpdateInput.addEventListener("blur", () => {
      lastUpdateInput.value = normaliserDateFrPourInput(lastUpdateInput.value, true);
      updateOutput();
    });
  }

  if (btnAddWeek) {
    btnAddWeek.addEventListener("click", () => {
      const weekDiv = createWeekForm({ prepend: true, focusDate: true });
      updateOutput();
      showToast("Nouvelle semaine ajoutée en haut du générateur. Renseigne la date : elle sera automatiquement rangée au bon endroit.", "info");
      return weekDiv;
    });
  }

  // Bannières (multi)
  if (btnAddBanner) {
    btnAddBanner.addEventListener("click", () => {
      const node = createBannerItem({ actif: true, emoji: "⚠️", texte: "", cibles: ["all"] });
      if (node && node.scrollIntoView) {
        node.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      updateOutput();
    });
  }

  if (bannerActifInput) {
    bannerActifInput.addEventListener("change", updateOutput);
  }

  if (settingMergeEaj23) {
    settingMergeEaj23.addEventListener("change", () => {
      document.querySelectorAll(".week-form").forEach(weekDiv => {
        const select = weekDiv.querySelector(".week-eaj23-mode");
        if (select && !weekDiv.dataset.loadedExisting) {
          select.value = settingMergeEaj23.checked ? "merged" : "separate";
        }
        updateWeekGroupModeUi(weekDiv);
      });
      updateOutput();
    });
  }

  // Toujours au moins 1 bannière au démarrage
  if (bannersContainer && !bannersContainer.querySelector(".banner-item")) {
    createBannerItem({ actif: true, emoji: "⚠️", texte: "", cibles: ["all"], startDate: getTodayFrDate(), endDate: "" });
  }

  if (btnGenerate) {
    btnGenerate.addEventListener("click", updateOutput);
  }

  if (btnSave) {
    btnSave.addEventListener("click", sauvegarderDansSupabase);
  }

  if (btnExport) {
    btnExport.addEventListener("click", () => {
      const js = buildPlanningJs();
      if (js.startsWith("// Aucune semaine valide")) {
        alert("Aucune semaine valide. Ajoute au moins une date JJ/MM/AAAA correcte.");
        return;
      }
      downloadFile("planning.js", js);
    });
  }

  const planningData = await chargerPlanningInitial();
  const ok = chargerPlanningExistant(planningData);
  if (lastUpdateInput && !lastUpdateInput.value.trim()) {
    lastUpdateInput.value = getTodayFrDate();
  }

  // Trie visuellement les semaines chargées
  reorderWeekFormsByDate();

  // Bouton retour haut
  initialiserBackToTop();

  // Si aucune donnée exploitable, on part sur un formulaire vierge
  if (!ok) {
    if (lastUpdateInput) {
      lastUpdateInput.value = getTodayFrDate();
    }
    createWeekForm();
    updateOutput();
  }
}

(async function boot() {
  initialiserAuthForm(async () => {
    if (!window.__EAJ_GENERATOR_READY__) {
      window.__EAJ_GENERATOR_READY__ = true;
      await initGeneratorApp();
    }
  });

  const ok = await verifierAccesAdmin();
  if (ok) {
    window.__EAJ_GENERATOR_READY__ = true;
    await initGeneratorApp();
  }
})();
