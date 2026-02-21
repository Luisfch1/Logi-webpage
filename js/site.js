(function () {
  const appLink = "https://luisfch1.github.io/Logi/"; 

  function openInstall() {
    const overlay = document.getElementById('installOverlay');
    const stepsEl = document.getElementById('installSteps');

    if (!overlay || !stepsEl) return;

    // Insertamos el micro-tutorial directamente
    stepsEl.innerHTML = `
      <div style="text-align: center; margin-bottom: 25px;">
        <p style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">Enlace de la aplicación:</p>
        <a href="${appLink}" target="_blank" style="color: #00ccff; font-weight: bold; text-decoration: none; font-size: 1.1rem; border: 1px dashed #00ccff; padding: 10px; border-radius: 8px; display: inline-block;">
          ${appLink}
        </a>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; border-top: 1px solid #eee; padding-top: 20px;">
        <div>
          <h4 style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
            <i data-lucide="smartphone"></i> Android
          </h4>
          <ol style="font-size: 0.85rem; padding-left: 18px; color: #444; line-height: 1.4;">
            <li>Abre el link en <b>Chrome</b>.</li>
            <li>Toca los <b>tres puntos (⋮)</b>.</li>
            <li>Dale a <b>"Instalar aplicación"</b>.</li>
          </ol>
        </div>
        <div>
          <h4 style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
            <i data-lucide="apple"></i> iOS (iPhone)
          </h4>
          <ol style="font-size: 0.85rem; padding-left: 18px; color: #444; line-height: 1.4;">
            <li>Abre el link en <b>Safari</b>.</li>
            <li>Toca el botón <b>Compartir</b> (↑).</li>
            <li>Elige <b>"Agregar al inicio"</b>.</li>
          </ol>
        </div>
      </div>
    `;

    // Reiniciar iconos de Lucide para el nuevo contenido
    if (window.lucide) window.lucide.createIcons();
    
    overlay.style.display = 'flex';
  }

  function closeInstall() {
    document.getElementById('installOverlay').style.display = 'none';
  }

  // Eventos
  document.addEventListener('click', (e) => {
    if (e.target.id === 'btnInstallNav' || e.target.id === 'btnInstallHero') {
      e.preventDefault();
      openInstall();
    }
    if (e.target.id === 'installClose' || e.target.id === 'installOverlay') {
      closeInstall();
    }
  });

  window.openInstall = openInstall;
  window.closeInstall = closeInstall;
})();