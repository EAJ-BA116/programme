(function () {
  function generateVersion() {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    return (
      now.getFullYear() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes())
    );
  }

  function loadScript(src, callback) {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => callback && callback();
    s.onerror = () => console.error("Erreur de chargement du script :", src);
    document.head.appendChild(s);
  }

  const version = generateVersion();
  console.log("Chargement planning.js version :", version);

  // 1) On charge d’abord planning.js avec le paramètre de version
  loadScript(`planning.js?v=${version}`, function () {
    console.log("planning.js chargé, chargement de script.js…");
    // 2) Puis seulement après, on charge script.js
    loadScript("script.js", function () {
      console.log("script.js chargé et initialisé");
    });
  });
})();
