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
  { id: "EAJ1", label: "Groupe 1 – EAJ1" },
  { id: "EAJ2", label: "Groupe 2 – EAJ2" },
  { id: "EAJ3", label: "Groupe 3 – EAJ3" }
];

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
const output         = document.getElementById("output");

// Bannières (multi)
const bannersContainer = document.getElementById("banners-container");
const btnAddBanner     = document.getElementById("btn-add-banner");

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
  const bgColor = baseColor.length === 7 ? baseColor + "25" : baseColor;

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

  let html = `${typeCfg.emoji} <strong>${typeCfg.label}</strong> – ${activity.texte}`;
  if (extras.length > 0) {
    html += `<br><small>${extras.join(" • ")}</small>`;
  }

  return `
    <div class="activity-chip" style="background:${bgColor};border-left:4px solid ${baseColor};">
      <span>${html}</span>
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

  row.appendChild(topLine);
  row.appendChild(extra);
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
  if (Array.isArray(weekObj.activitesCommunes) && weekObj.activitesCommunes.length > 0) {
    weekObj.activitesCommunes.forEach(entry => {
      const groupes = Array.isArray(entry.groupes) ? entry.groupes : [];
      const groupesLabel = groupes.length
        ? "Groupes concernés : " + groupes.join(" + ")
        : "Tous les groupes";

      html += `
        <article class="group-card week-common-card">
          <div class="week-common-emoji">🤝</div>
          <div class="week-common-title">Activité commune</div>
          <div class="week-common-groups">${groupesLabel}</div>

          <p class="label">Activités :</p>
          <div class="activities-list">
      `;

      (entry.activites || []).forEach(a => {
        html += createActivityChip(a, entry);
      });

      html += `
          </div>
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

  const presentGroups = new Set((weekObj.groupes || []).map(g => {
    if (g.titre.includes("EAJ1")) return "EAJ1";
    if (g.titre.includes("EAJ2")) return "EAJ2";
    if (g.titre.includes("EAJ3")) return "EAJ3";
    return "";
  }).filter(Boolean));

  (weekObj.groupes || []).forEach(g => {
    const groupId =
      g.titre.includes("EAJ1") ? "EAJ1" :
      g.titre.includes("EAJ2") ? "EAJ2" :
      g.titre.includes("EAJ3") ? "EAJ3" : "";

    html += `
      <article class="group-card" data-group="${groupId}">
        <div class="group-title">${g.titre}</div>

        <p class="label">Activités :</p>
        <div class="activities-list">
    `;

    (g.activites || []).forEach(a => {
      html += createActivityChip(a, g);
    });

    html += `
        </div>
        ${buildInfoBlock("Horaire (général) :", g.horaire || "")}
        ${buildInfoBlock("Lieu (général) :", g.lieu || "")}
        ${buildInfoBlock("Tenue (générale) :", g.tenue || "")}
        ${buildInfoBlock("Matériel à apporter (général) :", g.materiel || "")}
        ${buildTagLine(g.encadrant || "", g.tag || "")}
      </article>
    `;
  });

  // Groupes absents
  const ALL_GROUPS = [
    { id: "EAJ1", titre: "Groupe 1 – EAJ1" },
    { id: "EAJ2", titre: "Groupe 2 – EAJ2" },
    { id: "EAJ3", titre: "Groupe 3 – EAJ3" }
  ];

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

function createWeekForm() {
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

  // Réorganisation automatique lorsque la date change
  dateFrInput.addEventListener("change", reorderWeekFormsByDate);
  dateFrInput.addEventListener("blur", reorderWeekFormsByDate);


  // Groupes
  const groupsWrapper = weekDiv.querySelector(".groups-wrapper");
  GROUPS.forEach(g => {
    groupsWrapper.appendChild(createGroupForm(g.id, g.label));
  });

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

    updateOutput();
  });

  // Modifier = revenir au formulaire
  btnEdit.addEventListener("click", () => {
    weekDiv.querySelector(".week-edit").style.display = "block";
    weekDiv.querySelector(".week-preview").style.display = "none";

    btnEdit.style.display = "none";
    btnValidate.style.display = "inline-flex";
  });

  weeksContainer.appendChild(weekDiv);
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

  const weekObj = {
    isoDate: parsed.iso,
    date: parsed.label,
    statut: isSession ? "session" : "off",
    note: isSession ? (noteInput?.value.trim() || "") : "",
    messageOff: !isSession ? (messageOffInput?.value.trim() || "") : "",
    activitesCommunes: [],
    groupes: []
  };

  // -------- Groupes (EAJ1 / EAJ2 / EAJ3) --------
  const groupForms = weekDiv.querySelectorAll(".group-form");
  groupForms.forEach(groupDiv => {
    const enabled = groupDiv.querySelector(".group-enabled")?.checked;
    if (!enabled) return;

    const groupId = groupDiv.dataset.group;
    const meta = GROUPS.find(g => g.id === groupId);
    const titre = meta ? meta.label : (groupId || "Groupe");

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

      const act = { type, texte };
      if (actHoraire)   act.horaire  = actHoraire;
      if (actLieu)      act.lieu     = actLieu;
      if (actTenue)     act.tenue    = actTenue;
      if (actMateriel)  act.materiel = actMateriel;
      if (actEncadrant) act.encadrant= actEncadrant;

      activites.push(act);
    });

    const groupObj = { titre, activites };
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

      const act = { type, texte };
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

  // tri par date croissante
  weeks.sort((a, b) => (a.isoDate < b.isoDate ? -1 : a.isoDate > b.isoDate ? 1 : 0));
  return weeks;
}
// Réordonne les formulaires "semaine" par date (pour éviter l’effet "ajout en bas").
function reorderWeekFormsByDate() {
  if (!weeksContainer) return;
  const items = Array.from(document.querySelectorAll(".week-form"));
  const keyed = items.map((el, idx) => {
    const v = el.querySelector(".week-date-fr")?.value.trim() || "";
    const p = parseDateFr(v);
    return { el, idx, iso: p ? p.iso : null };
  });

  keyed.sort((a, b) => {
    if (a.iso && b.iso) return a.iso.localeCompare(b.iso);
    if (a.iso && !b.iso) return -1;
    if (!a.iso && b.iso) return 1;
    return a.idx - b.idx;
  });

  keyed.forEach(k => weeksContainer.appendChild(k.el));

  // Renumérote l’affichage (sans toucher aux IDs internes)
  Array.from(document.querySelectorAll(".week-form .week-title")).forEach((t, i) => {
    t.textContent = `Semaine n°${i + 1}`;
  });
}


// ===============================
//  Config générale + build JS
// ===============================

function getConfigData() {
  const { globalActif, ALERT_BANNERS } = getBannersDataFromForm();
  const auteur      = document.getElementById("lastupdate-auteur")?.value.trim() || "Yoann";
  const dateInput   = document.getElementById("lastupdate-date");

  // On lit la date affichée dans le champ ; si vide, on met la date du jour
  let dateTexte = dateInput?.value.trim();
  if (!dateTexte) {
    dateTexte = getTodayFrDate();
  }

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

  return {
    ALERT_BANNER: ALERT_BANNER_CFG,
    ALERT_BANNERS: Array.isArray(ALERT_BANNERS) ? ALERT_BANNERS : [],
    LAST_UPDATE: LAST_UPDATE_CFG
  };
}


function buildPlanningJs() {
  const weeks = getWeeksData();
  const { ALERT_BANNER, ALERT_BANNERS, LAST_UPDATE } = getConfigData();

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

function chargerPlanningExistant() {
  if (typeof SEMAINES === "undefined" || !Array.isArray(SEMAINES)) {
    return false;
  }

  // Config générale : bannières + dernière MAJ
  const bannerActifInput   = document.getElementById("banner-actif");
  const lastUpdateAuteur   = document.getElementById("lastupdate-auteur");
  const lastUpdateDate     = document.getElementById("lastupdate-date");

  // Nouveau format : ALERT_BANNERS (multi)
  if (typeof ALERT_BANNERS !== "undefined" && Array.isArray(ALERT_BANNERS)) {
    const anyActive = ALERT_BANNERS.some(b => b && b.actif);
    if (bannerActifInput) bannerActifInput.checked = anyActive;
    setBannersInFormFromData(ALERT_BANNERS, anyActive);
  }
  // Ancien format : ALERT_BANNER (simple)
  else if (typeof ALERT_BANNER !== "undefined" && ALERT_BANNER) {
    const isOn = !!ALERT_BANNER.actif;
    if (bannerActifInput) bannerActifInput.checked = isOn;
    setBannersInFormFromData([
      {
        actif: isOn,
        emoji: "⚠️",
        texte: ALERT_BANNER.texte || "",
        cibles: ["all"]
      }
    ], isOn);
  }

  if (typeof LAST_UPDATE !== "undefined" && LAST_UPDATE) {
    if (lastUpdateAuteur && LAST_UPDATE.auteur)  lastUpdateAuteur.value  = LAST_UPDATE.auteur;
    if (lastUpdateDate && LAST_UPDATE.dateTexte) lastUpdateDate.value     = LAST_UPDATE.dateTexte;
  } else if (lastUpdateDate) {
    lastUpdateDate.value = getTodayFrDate();
  }

  // On vide d’abord tout éventuel contenu existant
  weeksContainer.innerHTML = "";
  weekCounter = 0;

  // On trie les semaines par date ISO croissante
  const weeksSorted = [...SEMAINES].sort((a, b) => {
    if (a.isoDate < b.isoDate) return -1;
    if (a.isoDate > b.isoDate) return 1;
    return 0;
  });

  weeksSorted.forEach(weekObj => {
    const weekDiv = createWeekForm();

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

        let groupId = "";
        if (g.titre.includes("EAJ1")) groupId = "EAJ1";
        else if (g.titre.includes("EAJ2")) groupId = "EAJ2";
        else if (g.titre.includes("EAJ3")) groupId = "EAJ3";

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

          list.appendChild(row);
        });

        commonList.appendChild(commonDiv);
      });
    }

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
//  Initialisation globale
// ===============================

(function init() {
  const lastUpdateInput = document.getElementById("lastupdate-date");
  const bannerActifInput = document.getElementById("banner-actif");

  // Permet de taper la date facilement (ex: 23012026 -> 23/01/2026)
  if (lastUpdateInput) {
    lastUpdateInput.addEventListener("input", () => {
      const formatted = formatDateFrValue(lastUpdateInput.value || "");
      if (formatted !== lastUpdateInput.value) {
        lastUpdateInput.value = formatted;
      }
    });
  }

  if (btnAddWeek) {
    btnAddWeek.addEventListener("click", () => {
      createWeekForm();
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
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

  // Toujours au moins 1 bannière au démarrage
  if (bannersContainer && !bannersContainer.querySelector(".banner-item")) {
    createBannerItem({ actif: true, emoji: "⚠️", texte: "", cibles: ["all"], startDate: getTodayFrDate(), endDate: "" });
  }

  if (btnGenerate) {
    btnGenerate.addEventListener("click", updateOutput);
  }

  if (btnSave) {
    btnSave.addEventListener("click", () => {
      const js = buildPlanningJs();
      if (js.startsWith("// Aucune semaine valide")) {
        alert("Aucune semaine valide. Ajoute au moins une date JJ/MM/AAAA correcte.");
        return;
      }
      downloadFile("planning.js", js);
    });
  }

  // 1) On tente de charger le planning existant (planning.js)
  const ok = chargerPlanningExistant();
  // Trie visuellement les semaines chargées
  reorderWeekFormsByDate();

  // Bouton retour haut
  initialiserBackToTop();

  // 2) Si pas de planning.js ou SEMAINES vide, on part sur un formulaire vierge
  if (!ok) {
    if (lastUpdateInput) {
      lastUpdateInput.value = getTodayFrDate();
    }
    createWeekForm();
    updateOutput();
  }
})();
