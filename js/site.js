(function () {
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