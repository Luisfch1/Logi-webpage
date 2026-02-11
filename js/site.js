(function () {
  // ------------------------------------------------------------
  // Fondo ácido por secciones (aurora). Mantiene el glass bonito
  // sin ensuciar el contenido.
  // ------------------------------------------------------------
  const THEMES = {
    hero: {
      a1: "rgba(118,236,64,.26)",
      a2: "rgba(55,215,255,.16)",
      a3: "rgba(200,75,188,.14)",
      a4: "rgba(255,150,60,.12)",
    },
    resultados: {
      a1: "rgba(55,215,255,.18)",
      a2: "rgba(200,75,188,.18)",
      a3: "rgba(118,236,64,.16)",
      a4: "rgba(255,150,60,.10)",
    },
    como: {
      a1: "rgba(118,236,64,.22)",
      a2: "rgba(255,150,60,.14)",
      a3: "rgba(55,215,255,.14)",
      a4: "rgba(200,75,188,.12)",
    },
    funciones: {
      a1: "rgba(200,75,188,.18)",
      a2: "rgba(118,236,64,.18)",
      a3: "rgba(55,215,255,.14)",
      a4: "rgba(255,150,60,.10)",
    },
    cta: {
      a1: "rgba(255,150,60,.16)",
      a2: "rgba(118,236,64,.18)",
      a3: "rgba(55,215,255,.14)",
      a4: "rgba(200,75,188,.12)",
    },
  };

  function setTheme(name) {
    const t = THEMES[name];
    if (!t) return;
    const r = document.documentElement;
    r.style.setProperty("--a1", t.a1);
    r.style.setProperty("--a2", t.a2);
    r.style.setProperty("--a3", t.a3);
    r.style.setProperty("--a4", t.a4);
  }

  // Solo si existe IntersectionObserver
  if ("IntersectionObserver" in window) {
    const sections = Array.from(document.querySelectorAll("[data-theme]"));
    if (sections.length) {
      let current = null;
      const io = new IntersectionObserver(
        (entries) => {
          // Nos quedamos con el más visible
          const best = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!best) return;
          const next = best.target.getAttribute("data-theme");
          if (next && next !== current) {
            current = next;
            setTheme(next);
          }
        },
        { threshold: [0.22, 0.35, 0.5, 0.65], rootMargin: "-20% 0px -45% 0px" }
      );
      sections.forEach((s) => io.observe(s));
      // Tema inicial
      setTheme(sections[0].getAttribute("data-theme") || "hero");
    }
  }

  function platform() {
    const ua = navigator.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    return { isIOS, isAndroid, isMobile: isIOS || isAndroid };
  }

  const overlay = document.getElementById("installOverlay");
  const closeBtn = document.getElementById("installClose");
  const titleEl = document.getElementById("installTitle");
  const introEl = document.getElementById("installIntro");
  const stepsEl = document.getElementById("installSteps");
  const qrBox = document.getElementById("qrBox");
  const qrUrl = document.getElementById("qrUrl");
  const qrCanvas = document.getElementById("qrCanvas");

  function addStep(n, text) {
    const div = document.createElement("div");
    div.className = "step";
    div.innerHTML = `<div class="num">${n}</div><div>${text}</div>`;
    stepsEl.appendChild(div);
  }

  function openInstall() {
    const p = platform();
    stepsEl.innerHTML = "";
    qrBox.hidden = true;

    if (p.isIOS) {
      titleEl.textContent = "Instalar Logi en iPhone";
      introEl.textContent = "Recomendado: Safari. Toma 20 segundos.";
      addStep(1, "Toca el botón Compartir (cuadrado con flecha hacia arriba).");
      addStep(2, "Selecciona “Agregar a pantalla de inicio”.");
      addStep(3, "Confirma en “Agregar”.");
    } else if (p.isAndroid) {
      titleEl.textContent = "Instalar Logi en Android";
      introEl.textContent = "Recomendado: Chrome. Toma 15 segundos.";
      addStep(1, "Abre esta página en Chrome.");
      addStep(2, "Toca el menú ⋮ (arriba a la derecha).");
      addStep(3, "Elige “Instalar app” o “Agregar a pantalla principal”.");
    } else {
      titleEl.textContent = "Instalar Logi";
      introEl.textContent = "En PC no se instala como app. Abre esta web en tu celular con el QR:";
      const url = window.location.href.replace(/#.*$/, "");
      qrUrl.textContent = url;
      qrBox.hidden = false;

      if (window.QRCode && qrCanvas) {
        window.QRCode.toCanvas(qrCanvas, url, { margin: 1, width: 170 }, function (err) {
          if (err) console.error(err);
        });
      }
    }

    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");
  }

  function closeInstall() {
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll("[data-open-install]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e && e.preventDefault) e.preventDefault();
      openInstall();
    });
  });

  closeBtn?.addEventListener("click", closeInstall);
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeInstall();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeInstall();
  });
})();