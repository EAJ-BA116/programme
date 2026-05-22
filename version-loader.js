(function () {
  function generateVersion() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    return (
      now.getFullYear() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds())
    );
  }

  function looksLikeBadScript(text) {
    const start = String(text || "").trimStart().slice(0, 120).toLowerCase();
    return (
      start.startsWith("<") ||
      start.startsWith("404:") ||
      start.startsWith("not found") ||
      start.includes("<!doctype html") ||
      start.includes("<html")
    );
  }

  function loadScriptClassic(src, callback) {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => callback && callback(true);
    s.onerror = () => {
      console.error("Erreur de chargement du script :", src);
      callback && callback(false);
    };
    document.head.appendChild(s);
  }

  function loadScriptSafe(src, callback, options = {}) {
    const optional = options.optional === true;

    // Sur un vrai serveur, on vérifie d'abord que le fichier n'est pas une page HTML/404.
    // Ça évite les erreurs du genre : "Unexpected token '<'" quand un fichier .js manque.
    if (window.location.protocol !== "file:" && window.fetch) {
      fetch(src, { cache: "no-store" })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return res.text();
        })
        .then((text) => {
          if (looksLikeBadScript(text)) {
            const message = `Fichier JS invalide ou page HTML reçue à la place : ${src}`;
            if (optional) {
              console.warn(message);
              callback && callback(false);
              return;
            }
            throw new Error(message);
          }

          const s = document.createElement("script");
          s.text = text + `\n//# sourceURL=${src}`;
          document.head.appendChild(s);
          callback && callback(true);
        })
        .catch((error) => {
          const label = optional ? "Script optionnel ignoré" : "Script requis introuvable/invalide";
          console.error(`${label} : ${src}`, error);
          callback && callback(false);
        });
      return;
    }

    // Mode fichier local : fetch est souvent bloqué, donc on garde l'injection classique.
    loadScriptClassic(src, callback);
  }

  const build = (window.EAJ_BUILD || "").toString();
  const version = (build ? `${build}-${generateVersion()}` : generateVersion());
  console.log("Chargement version :", version);

  const cssLink = document.getElementById("main-style")
    || document.querySelector('link[rel="stylesheet"][href^="style.css"]');
  if (cssLink) {
    cssLink.href = `style.css?v=${version}`;
  }

  // Ordre important : Supabase SDK + config -> planning.js secours -> API planning -> script public.
  loadScriptClassic("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", function () {
    loadScriptSafe(`./supabase-config.js?v=${version}`, function () {
      loadScriptSafe(`./planning.js?v=${version}`, function () {
        loadScriptSafe(`./planning-api.js?v=${version}`, function (apiOk) {
          if (!apiOk) return;
          loadScriptSafe(`./script.js?v=${version}`, function () {
            console.log("script.js chargé et initialisé");
          });
        });
      }, { optional: true });
    });
  });
})();
