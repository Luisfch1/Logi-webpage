(function () {
  // Tu link real de GitHub Pages
  const appLink = "https://luisfch1.github.io/Logi/"; 

  function openInstall() {
    const overlay = document.getElementById('installOverlay');
    const titleEl = document.getElementById('installTitle');
    const introEl = document.getElementById('installIntro');
    const stepsEl = document.getElementById('installSteps');
    const qrBox = document.getElementById('qrBox');
    const qrCanvas = document.getElementById('qrCanvas');

    if (!overlay) return;

    // Detectar Sistema Operativo
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    // Limpiar contenido previo
    stepsEl.innerHTML = '';
    qrBox.style.display = 'none';

    if (isIOS) {
      titleEl.textContent = 'Instalar en iOS';
      introEl.textContent = 'Sigue estos pasos en tu iPhone:';
      stepsEl.innerHTML = `
        <div style="text-align:left; font-size: 0.9rem; margin-top:10px;">
          1. Toca el botón <strong>Compartir</strong> (cuadrado con flecha arriba).<br>
          2. Desliza y elige <strong>"Agregar al inicio"</strong>.<br>
          3. Toca <strong>"Agregar"</strong> arriba a la derecha.
        </div>`;
    } else if (isAndroid) {
      titleEl.textContent = 'Instalar en Android';
      introEl.textContent = 'Para una mejor experiencia:';
      stepsEl.innerHTML = `
        <div style="text-align:left; font-size: 0.9rem; margin-top:10px;">
          1. Toca los <strong>tres puntos (⋮)</strong> en Chrome.<br>
          2. Selecciona <strong>"Instalar aplicación"</strong> o "Agregar a pantalla principal".
        </div>`;
    } else {
      // Escritorio / PC: Mostrar el QR
      titleEl.textContent = 'Lleva Logi a tu Obra';
      introEl.textContent = 'Escanea con tu celular para abrir la app:';
      qrBox.style.display = 'block';

      if (window.QRCode && qrCanvas) {
        window.QRCode.toCanvas(qrCanvas, appLink, { width: 220, margin: 1 }, function (err) {
          if (err) console.error("Error QR:", err);
        });
      }
    }

    overlay.style.display = 'flex';
  }

  function closeInstall() {
    document.getElementById('installOverlay').style.display = 'none';
  }

  // Eventos para abrir y cerrar
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-install]')) {
      e.preventDefault();
      openInstall();
    }
    if (e.target.id === 'installClose' || e.target.id === 'installOverlay') {
      closeInstall();
    }
  });
})();