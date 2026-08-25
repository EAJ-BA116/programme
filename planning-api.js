// ======================================================
// API Planning EAJ — Supabase + fallback planning.js
// ======================================================
// Le site public lit Supabase sans compte.
// Le générateur exige une connexion Supabase + un statut admin.

(function () {
  const DEFAULT_TABLE = "eaj_planning_state";
  const DEFAULT_BACKUPS_TABLE = "eaj_planning_backups";
  const DEFAULT_ROW_ID = "main";
  const OFFLINE_PLANNING_CACHE_KEY = "eaj_offline_planning_v1";
  const PUBLIC_INFO_CACHE_KEY = "eaj_public_info_journal_v1";

  const state = {
    client: null,
    current: null,
    realtimeChannel: null
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readFallbackGlobals() {
    let semaines = [];
    let alertBanners = [];
    let alertBanner = { actif: false, texte: "" };
    let lastUpdate = { auteur: "", dateTexte: "" };
    let settings = { mergeEaj23: true };

    try {
      if (typeof SEMAINES !== "undefined" && Array.isArray(SEMAINES)) semaines = SEMAINES;
    } catch (e) {}

    try {
      if (typeof ALERT_BANNERS !== "undefined" && Array.isArray(ALERT_BANNERS)) alertBanners = ALERT_BANNERS;
    } catch (e) {}

    try {
      if (typeof ALERT_BANNER !== "undefined" && ALERT_BANNER) alertBanner = ALERT_BANNER;
    } catch (e) {}

    try {
      if (typeof LAST_UPDATE !== "undefined" && LAST_UPDATE) lastUpdate = LAST_UPDATE;
    } catch (e) {}

    try {
      if (typeof PLANNING_SETTINGS !== "undefined" && PLANNING_SETTINGS) settings = PLANNING_SETTINGS;
    } catch (e) {}

    return normalizePlanningData({
      semaines,
      alertBanners,
      alertBanner,
      lastUpdate,
      settings,
      source: "planning.js",
      version: null,
      updatedAt: null
    });
  }

  function writeJsonCache(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Cache local indisponible :", error);
      return false;
    }
  }

  function readJsonCache(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Lecture du cache local impossible :", error);
      return null;
    }
  }

  function cachePlanningForOffline(data) {
    const normalized = normalizePlanningData(data);
    writeJsonCache(OFFLINE_PLANNING_CACHE_KEY, {
      cachedAt: new Date().toISOString(),
      data: {
        semaines: normalized.semaines || [],
        alertBanners: normalized.alertBanners || [],
        alertBanner: normalized.alertBanner || { actif: false, texte: "" },
        lastUpdate: normalized.lastUpdate || { auteur: "", dateTexte: "" },
        settings: normalized.settings || { mergeEaj23: true },
        version: normalized.version,
        updatedAt: normalized.updatedAt,
        updatedByName: normalized.updatedByName || "",
        source: "offline-cache"
      }
    });
  }

  function readOfflinePlanningCache() {
    const cached = readJsonCache(OFFLINE_PLANNING_CACHE_KEY);
    if (!cached || !cached.data) return null;
    const normalized = normalizePlanningData({ ...cached.data, source: "offline-cache" });
    normalized.cachedAt = cached.cachedAt || null;
    return normalized;
  }

  function cachePublicInfoJournal(items) {
    writeJsonCache(PUBLIC_INFO_CACHE_KEY, {
      cachedAt: new Date().toISOString(),
      items: Array.isArray(items) ? items : []
    });
  }

  function readCachedPublicInfoJournal() {
    const cached = readJsonCache(PUBLIC_INFO_CACHE_KEY);
    return cached && Array.isArray(cached.items) ? cached.items : [];
  }

  function getConfig() {
    return window.EAJ_SUPABASE || {};
  }

  function isConfigured() {
    const cfg = getConfig();
    const url = String(cfg.url || "").trim();
    const key = String(cfg.anonKey || "").trim();

    return Boolean(
      url &&
      key &&
      !url.includes("TON-PROJET") &&
      !key.includes("TON_ANON") &&
      !key.includes("PUBLISHABLE")
    );
  }

  function getTableName() {
    return getConfig().table || DEFAULT_TABLE;
  }

  function getBackupTableName() {
    return getConfig().backupsTable || DEFAULT_BACKUPS_TABLE;
  }

  function getRowId() {
    return getConfig().rowId || DEFAULT_ROW_ID;
  }

  function getClient() {
    if (state.client) return state.client;

    if (!isConfigured()) {
      throw new Error("Supabase n'est pas encore configuré dans supabase-config.js.");
    }

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("La librairie Supabase n'est pas chargée.");
    }

    const cfg = getConfig();
    state.client = window.supabase.createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return state.client;
  }

  function normalizePlanningData(input) {
    const data = input || {};
    const semaines = Array.isArray(data.semaines) ? data.semaines : [];
    const alertBanners = Array.isArray(data.alertBanners)
      ? data.alertBanners
      : (Array.isArray(data.alert_banners) ? data.alert_banners : []);

    const alertBanner = data.alertBanner || data.alert_banner || { actif: false, texte: "" };
    const lastUpdate = data.lastUpdate || data.last_update || { auteur: "", dateTexte: "" };
    const rawSettings = data.settings || data.planning_settings || {};
    const settings = {
      mergeEaj23: rawSettings.mergeEaj23 !== false
    };

    return {
      semaines,
      alertBanners,
      alertBanner,
      lastUpdate,
      settings,
      version: typeof data.version === "number" ? data.version : null,
      updatedAt: data.updatedAt || data.updated_at || null,
      updatedByName: data.updatedByName || data.updated_by_name || "",
      source: data.source || "local"
    };
  }

  function normalizeRow(row) {
    if (!row) return null;
    return normalizePlanningData({
      semaines: row.semaines,
      alertBanners: row.alert_banners,
      alertBanner: row.alert_banner,
      lastUpdate: row.last_update,
      settings: row.settings,
      version: row.version,
      updatedAt: row.updated_at,
      updatedByName: row.updated_by_name,
      source: "supabase"
    });
  }

  function applyData(data) {
    const normalized = normalizePlanningData(data);
    state.current = normalized;

    // Compat pour d'éventuels scripts qui lisent window.*
    // Les anciens const de planning.js restent intouchables, donc le nouveau code lit EAJPlanning.getCurrentData().
    window.EAJ_CURRENT_PLANNING = normalized;
    window.EAJ_PLANNING_SOURCE = normalized.source;

    return normalized;
  }

  function getCurrentData() {
    if (!state.current) {
      applyData(readFallbackGlobals());
    }
    return state.current;
  }

  async function fetchPlanningFromSupabase() {
    const client = getClient();
    const { data, error } = await client
      .from(getTableName())
      .select("*")
      .eq("id", getRowId())
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Aucune ligne de planning trouvée dans Supabase.");

    const normalized = normalizeRow(data);
    const applied = applyData(normalized);
    cachePlanningForOffline(applied);
    return applied;
  }

  async function loadPublicPlanning() {
    // Le planning.js reste le dernier filet de sécurité intégré au site.
    applyData(readFallbackGlobals());

    const offlineCached = readOfflinePlanningCache();

    if (!isConfigured()) {
      if (offlineCached) return applyData(offlineCached);
      console.warn("Supabase non configuré : fallback planning.js utilisé.");
      return getCurrentData();
    }

    // Hors connexion : on privilégie la dernière version réellement consultée.
    if (typeof navigator !== "undefined" && navigator.onLine === false && offlineCached) {
      return applyData(offlineCached);
    }

    try {
      return await fetchPlanningFromSupabase();
    } catch (error) {
      if (offlineCached) {
        console.warn("Supabase inaccessible : dernière copie locale utilisée :", error.message || error);
        return applyData(offlineCached);
      }
      console.warn("Impossible de charger Supabase, fallback planning.js utilisé :", error.message || error);
      return getCurrentData();
    }
  }

  async function getSession() {
    const client = getClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function signIn(email, password) {
    const client = getClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session || null;
  }

  async function signOut() {
    const client = getClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  async function getAdminStatus() {
    const session = await getSession();
    if (!session || !session.user) {
      return { ok: false, session: null, admin: null, reason: "not_authenticated" };
    }

    const client = getClient();
    const { data, error } = await client
      .from("eaj_admins")
      .select("user_id, display_name, active")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data || data.active !== true) {
      return { ok: false, session, admin: data || null, reason: "not_admin" };
    }

    return { ok: true, session, admin: data, reason: "admin" };
  }

  async function savePlanning(payload) {
    const client = getClient();
    const session = await getSession();
    if (!session || !session.user) {
      throw new Error("Connexion expirée. Reconnecte-toi puis réessaie.");
    }

    const current = getCurrentData();
    const currentVersion = typeof current.version === "number" ? current.version : 1;
    const nextVersion = currentVersion + 1;
    const updatedByName = payload.updatedByName || payload.lastUpdate?.auteur || session.user.email || "Admin";

    const updatePayload = {
      semaines: payload.semaines || [],
      alert_banners: payload.alertBanners || [],
      alert_banner: payload.alertBanner || { actif: false, texte: "" },
      last_update: payload.lastUpdate || { auteur: updatedByName, dateTexte: "" },
      settings: payload.settings || current.settings || { mergeEaj23: true },
      version: nextVersion,
      updated_by: session.user.id,
      updated_by_name: updatedByName,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await client
      .from(getTableName())
      .update(updatePayload)
      .eq("id", getRowId())
      .eq("version", currentVersion)
      .select("*");

    if (error) throw error;

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Conflit : le planning a été modifié ailleurs. Recharge la page avant d'enregistrer.");
    }

    return applyData(normalizeRow(data[0]));
  }


  function getTodayFrDate() {
    const d = new Date();
    const jj = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${jj}/${mm}/${yyyy}`;
  }

  function toBackupSnapshot(data) {
    const normalized = normalizePlanningData(data);
    return {
      semaines: clone(normalized.semaines || []),
      alertBanners: clone(normalized.alertBanners || []),
      alertBanner: clone(normalized.alertBanner || { actif: false, texte: "" }),
      lastUpdate: clone(normalized.lastUpdate || { auteur: "", dateTexte: "" }),
      settings: clone(normalized.settings || { mergeEaj23: true }),
      version: normalized.version,
      updatedAt: normalized.updatedAt,
      updatedByName: normalized.updatedByName,
      source: normalized.source || "supabase"
    };
  }

  async function listBackups(limit = 30) {
    const client = getClient();
    const { data, error } = await client
      .from(getBackupTableName())
      .select("id, reason, label, note, backup_type, created_at, created_by_name, source_version")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  async function createBackup(reason = "Sauvegarde automatique", options = {}) {
    const client = getClient();
    const session = await getSession();
    if (!session || !session.user) {
      throw new Error("Connexion expirée. Reconnecte-toi puis réessaie.");
    }

    // Sauvegarde l'état réel de la base, pas seulement l'état local de l'écran.
    const fresh = await fetchPlanningFromSupabase();
    const snapshot = toBackupSnapshot(fresh);
    const createdByName = snapshot.lastUpdate?.auteur || session.user.email || "Admin";
    const safeReason = String(reason || "Sauvegarde").trim().slice(0, 250) || "Sauvegarde";
    const label = String(options.label || "").trim().slice(0, 120) || null;
    const note = String(options.note || "").trim().slice(0, 1000) || null;
    const backupType = ["automatic", "manual", "safety"].includes(options.backupType)
      ? options.backupType
      : (safeReason.toLowerCase().includes("automatique") ? "automatic" : "manual");

    const { data, error } = await client
      .from(getBackupTableName())
      .insert({
        reason: safeReason,
        label,
        note,
        backup_type: backupType,
        planning: snapshot,
        source_version: snapshot.version,
        created_by: session.user.id,
        created_by_name: createdByName
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  async function getBackup(backupId) {
    const client = getClient();
    const { data, error } = await client
      .from(getBackupTableName())
      .select("*")
      .eq("id", backupId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Sauvegarde introuvable.");
    return data;
  }

  async function replacePlanningSnapshot(snapshot, options = {}) {
    const client = getClient();
    const session = await getSession();
    if (!session || !session.user) {
      throw new Error("Connexion expirée. Reconnecte-toi puis réessaie.");
    }

    const current = await fetchPlanningFromSupabase();
    const currentVersion = typeof current.version === "number" ? current.version : 1;
    const nextVersion = currentVersion + 1;
    const normalized = normalizePlanningData(snapshot || {});
    const updatedByName = options.updatedByName || normalized.lastUpdate?.auteur || session.user.email || "Admin";

    const updatePayload = {
      semaines: normalized.semaines || [],
      alert_banners: normalized.alertBanners || [],
      alert_banner: normalized.alertBanner || { actif: false, texte: "" },
      last_update: normalized.lastUpdate || { auteur: updatedByName, dateTexte: getTodayFrDate() },
      settings: normalized.settings || current.settings || { mergeEaj23: true },
      version: nextVersion,
      updated_by: session.user.id,
      updated_by_name: updatedByName,
      updated_at: new Date().toISOString()
    };

    if (!updatePayload.last_update.dateTexte) {
      updatePayload.last_update.dateTexte = getTodayFrDate();
    }
    if (!updatePayload.last_update.auteur) {
      updatePayload.last_update.auteur = updatedByName;
    }

    const { data, error } = await client
      .from(getTableName())
      .update(updatePayload)
      .eq("id", getRowId())
      .eq("version", currentVersion)
      .select("*");

    if (error) throw error;
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Conflit : le planning a changé pendant l'opération. Recharge puis réessaie.");
    }

    return applyData(normalizeRow(data[0]));
  }

  async function resetPlanningWithBackup(options = {}) {
    await createBackup("Sauvegarde automatique avant remise à zéro", { backupType: "safety" });
    const updatedByName = options.updatedByName || "Admin EAJ";
    return replacePlanningSnapshot({
      semaines: [],
      alertBanners: [],
      alertBanner: { actif: false, texte: "" },
      lastUpdate: { auteur: updatedByName, dateTexte: getTodayFrDate() },
      settings: clone(getCurrentData().settings || { mergeEaj23: true })
    }, { updatedByName });
  }

  async function restoreBackup(backupId, options = {}) {
    const backup = await getBackup(backupId);
    await createBackup("Sauvegarde automatique avant restauration", { backupType: "safety" });
    return replacePlanningSnapshot(backup.planning || {}, options);
  }

  async function deleteBackup(backupId) {
    const client = getClient();
    const session = await getSession();
    if (!session || !session.user) {
      throw new Error("Connexion expirée. Reconnecte-toi puis réessaie.");
    }
    const { data, error } = await client
      .from(getBackupTableName())
      .delete()
      .eq("id", backupId)
      .select("id");
    if (error) throw error;
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Suppression refusée ou sauvegarde introuvable. Vérifie la migration v1.9.0.");
    }
    return true;
  }

  function subscribePlanningUpdates(callback) {
    const cfg = getConfig();
    if (!isConfigured() || cfg.realtime === false) return null;

    const client = getClient();
    if (state.realtimeChannel) {
      try { client.removeChannel(state.realtimeChannel); } catch (e) {}
      state.realtimeChannel = null;
    }

    state.realtimeChannel = client
      .channel("eaj-planning-live")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: getTableName(),
          filter: `id=eq.${getRowId()}`
        },
        (payload) => {
          const data = applyData(normalizeRow(payload.new));
          cachePlanningForOffline(data);
          if (typeof callback === "function") callback(data, payload);
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.warn("Realtime Supabase indisponible pour le planning.");
        }
      });

    return state.realtimeChannel;
  }



  function getPushPublicKey() {
    const key = String(getConfig().pushPublicKey || "").trim();
    if (!key || key.includes("A_REMPLACER") || key.includes("VAPID")) return "";
    return key;
  }

  async function savePushSubscription(subscription, preferences = {}) {
    if (!subscription || !subscription.endpoint) {
      throw new Error("Abonnement push invalide.");
    }

    const json = subscription.toJSON ? subscription.toJSON() : subscription;
    const keys = json.keys || {};

    if (!keys.p256dh || !keys.auth) {
      throw new Error("Clés de notification absentes.");
    }

    const prefs = {
      eaj1: preferences.eaj1 === true,
      eaj2: preferences.eaj2 === true,
      eaj3: preferences.eaj3 === true,
      systemUpdates: preferences.systemUpdates === true
    };

    const client = getClient();
    const { error } = await client.rpc("eaj_upsert_push_subscription_v2", {
      p_endpoint: String(json.endpoint || subscription.endpoint),
      p_p256dh: String(keys.p256dh),
      p_auth: String(keys.auth),
      p_user_agent: String(navigator.userAgent || "").slice(0, 500),
      p_eaj1: prefs.eaj1,
      p_eaj2: prefs.eaj2,
      p_eaj3: prefs.eaj3,
      p_system_updates: prefs.systemUpdates
    });

    if (error) throw error;
    return true;
  }

  async function getPushPreferences(endpoint) {
    if (!endpoint) return { eaj1: false, eaj2: false, eaj3: false, systemUpdates: false, enabled: false };
    const client = getClient();
    const { data, error } = await client.rpc("eaj_get_push_preferences", {
      p_endpoint: String(endpoint)
    });
    if (error) throw error;
    const prefs = data || {};
    return {
      eaj1: prefs.eaj1 === true,
      eaj2: prefs.eaj2 === true,
      eaj3: prefs.eaj3 === true,
      systemUpdates: prefs.system_updates === true || prefs.systemUpdates === true,
      enabled: prefs.enabled === true
    };
  }

  async function removePushSubscription(endpoint) {
    if (!endpoint) return true;
    const client = getClient();
    const { error } = await client.rpc("eaj_remove_push_subscription", {
      p_endpoint: String(endpoint)
    });
    if (error) throw error;
    return true;
  }

  async function getPushSubscriberCount() {
    const client = getClient();
    const { count, error } = await client
      .from("eaj_push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("enabled", true);

    if (error) throw error;
    return Number(count || 0);
  }

  async function getPushSubscriberStats() {
    const client = getClient();
    const { data, error } = await client
      .from("eaj_push_subscriptions")
      .select("pref_eaj1, pref_eaj2, pref_eaj3, pref_system_updates")
      .eq("enabled", true);

    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    return {
      total: rows.length,
      eaj1: rows.filter(r => r.pref_eaj1 === true).length,
      eaj2: rows.filter(r => r.pref_eaj2 === true).length,
      eaj3: rows.filter(r => r.pref_eaj3 === true).length,
      eaj23: rows.filter(r => r.pref_eaj2 === true || r.pref_eaj3 === true).length,
      allEaj: rows.filter(r => r.pref_eaj1 === true || r.pref_eaj2 === true || r.pref_eaj3 === true).length,
      system: rows.filter(r => r.pref_system_updates === true).length
    };
  }

  async function listPushNotifications(limit = 10) {
    const client = getClient();
    const { data, error } = await client
      .from("eaj_notifications")
      .select("id, kind, audience, title, body, url, status, sent_count, failed_count, created_at, created_by_name")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  async function deletePushNotification(id) {
    const notificationId = String(id || "").trim();
    if (!notificationId) throw new Error("Identifiant de notification manquant.");

    const client = getClient();
    const session = await getSession();
    if (!session || !session.user) {
      throw new Error("Connexion expirée. Reconnecte-toi puis réessaie.");
    }

    const { data, error } = await client.rpc("eaj_delete_notification", {
      p_id: notificationId
    });
    if (error) throw error;
    return data === true;
  }

  async function sendPushNotification(payload) {
    const client = getClient();
    const session = await getSession();
    if (!session || !session.user) {
      throw new Error("Connexion expirée. Reconnecte-toi puis réessaie.");
    }

    const body = {
      kind: String(payload?.kind || "information"),
      audience: String(payload?.audience || "all_eaj"),
      title: String(payload?.title || "").trim(),
      body: String(payload?.body || "").trim(),
      url: String(payload?.url || "index.html").trim()
    };

    if (!body.title || !body.body) {
      throw new Error("Le titre et le message de la notification sont obligatoires.");
    }

    const { data, error } = await client.functions.invoke("send-eaj-push", {
      body
    });

    if (error) throw error;
    if (data && data.error) throw new Error(data.error);
    return data || {};
  }

  async function listPublicInfoJournal(limit = 30) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 30, 50));

    if (!isConfigured()) return readCachedPublicInfoJournal().slice(0, safeLimit);
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return readCachedPublicInfoJournal().slice(0, safeLimit);
    }

    try {
      const client = getClient();
      const { data, error } = await client.rpc("eaj_list_public_notifications", { p_limit: safeLimit });
      if (error) throw error;
      const items = Array.isArray(data) ? data : [];
      cachePublicInfoJournal(items);
      return items;
    } catch (error) {
      console.warn("Journal des informations indisponible en ligne, cache local utilisé :", error.message || error);
      return readCachedPublicInfoJournal().slice(0, safeLimit);
    }
  }

  function getOfflinePlanningCache() {
    return readOfflinePlanningCache();
  }

  function getCachedInfoJournal() {
    return readCachedPublicInfoJournal();
  }

  applyData(readFallbackGlobals());

  window.EAJPlanning = {
    isConfigured,
    getConfig,
    getClient,
    getCurrentData,
    loadPublicPlanning,
    fetchPlanningFromSupabase,
    subscribePlanningUpdates,
    getSession,
    signIn,
    signOut,
    getAdminStatus,
    savePlanning,
    listBackups,
    createBackup,
    resetPlanningWithBackup,
    restoreBackup,
    deleteBackup,
    getPushPublicKey,
    savePushSubscription,
    getPushPreferences,
    removePushSubscription,
    getPushSubscriberCount,
    getPushSubscriberStats,
    listPushNotifications,
    deletePushNotification,
    sendPushNotification,
    listPublicInfoJournal,
    getOfflinePlanningCache,
    getCachedInfoJournal,
    applyData,
    normalizePlanningData
  };
})();
