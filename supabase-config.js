// ======================================================
// Configuration Supabase — À REMPLIR AVANT MISE EN LIGNE
// ======================================================
// 1) Crée ton projet Supabase.
// 2) Va dans Project Settings > API.
// 3) Copie l'URL du projet et la clé anon / publishable.
// 4) Remplace les valeurs ci-dessous.
//
// IMPORTANT :
// - La clé anon / publishable peut être utilisée côté navigateur.
// - Ne mets JAMAIS la clé service_role dans ce fichier.

window.EAJ_SUPABASE = {
  url: "https://otfhuclooihigvazkfxf.supabase.co",
  anonKey: "sb_publishable_O3o07NBqquPMw3-gB1EnHQ_nA0uBZ_U",

  // Normalement, tu ne touches pas à ces 2 lignes.
  table: "eaj_planning_state",
  rowId: "main",
  realtime: true,

  // Notifications push Web Push (clé publique VAPID).
  // À renseigner après génération des clés (voir README-PUSH.md).
  pushPublicKey: "BHmwd4nHG48XUJu4z7eroAC-qRB41O6o4NjV9n-pqgN1ZOCfwpY7oGGidNcBmEyE1u7ceavHuyplQ7dmfec-7WE"
};
