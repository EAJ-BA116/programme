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

  function loadScript(src, callback) {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => callback && callback();
    s.onerror = () => console.error("Erreur de chargement du script :", src);
    document.head.appendChild(s);
  }

  const build = (window.EAJ_BUILD || "").toString();
  const version = (build ? `${build}-${generateVersion()}` : generateVersion());
  console.log("Chargement version :", version);

  // ✅ Cache-bust CSS (utile sur GitHub Pages + cache navigateur)
  const cssLink = document.getElementById("main-style")
    || document.querySelector('link[rel="stylesheet"][href^="style.css"]');
  if (cssLink) {
    cssLink.href = `style.css?v=${version}`;
  }

  // 1) On charge d’abord planning.js avec le paramètre de version
  loadScript(`planning.js?v=${version}`, function () {
    console.log("planning.js chargé, chargement de script.js…");
    // 2) Puis seulement après, on charge script.js (aussi versionné)
    loadScript(`script.js?v=${version}`, function () {
      console.log("script.js chargé et initialisé");
    });
  });
})();
