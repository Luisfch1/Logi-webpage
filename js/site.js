(function () {
  const root = document.documentElement;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const header = document.querySelector('.top');

  // ------------------------------------------------------------
  // Header: botón menú + overlay (inyectado, sin tocar HTML)
  // ------------------------------------------------------------
  const nav = document.querySelector('.nav');
  const links = document.querySelector('.links');

  function buildMenuOverlay() {
    if (!nav || !links) return;
    if (document.querySelector('#menuOverlay')) return;

    const btn = document.createElement('button');
    btn.className = 'menuBtn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Menú');
    btn.innerHTML = '☰';
    nav.insertBefore(btn, nav.firstChild);

    const overlay = document.createElement('div');
    overlay.className = 'menuOverlay';
    overlay.id = 'menuOverlay';
    overlay.innerHTML = `
      <div class="menuPanel" role="dialog" aria-modal="true" aria-label="Menú">
        <div class="menuHead">
          <strong>Logi</strong>
          <button class="menuClose" type="button" aria-label="Cerrar">✕</button>
        </div>
        <div class="menuBody"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const menuBody = overlay.querySelector('.menuBody');
    const close = overlay.querySelector('.menuClose');

    // Clonamos links del header dentro del menú
    Array.from(links.querySelectorAll('a')).forEach((a) => {
      const item = document.createElement('a');
      item.href = a.getAttribute('href') || '#';
      item.textContent = a.textContent || 'Link';
      item.addEventListener('click', () => hide());
      menuBody.appendChild(item);
    });

    // CTA de instalar (si existe)
    const installBtn = document.createElement('button');
    installBtn.type = 'button';
    installBtn.textContent = 'Instalar Logi';
    installBtn.setAttribute('data-open-install', '');
    menuBody.appendChild(installBtn);

    function show() {
      overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
    function hide() {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', show);
    close.addEventListener('click', hide);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) hide();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hide();
    });
  }

  buildMenuOverlay();

  // Header “más sólido” cuando se hace scroll
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle('isSolid', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  // ------------------------------------------------------------
  // Escenas: logo/ink cambian según la sección visible
  // ------------------------------------------------------------

  function applyFromSection(sec) {
    if (!sec) return;
    const cs = getComputedStyle(sec);
    const ink = (cs.getPropertyValue('--header-ink') || '').trim();
    const theme = (cs.getPropertyValue('--theme-color') || '').trim();

    if (ink) root.style.setProperty('--header-ink', ink);
    if (theme) {
      root.style.setProperty('--theme-color', theme);
      if (metaTheme) metaTheme.setAttribute('content', theme);
    }
  }

  if ('IntersectionObserver' in window) {
    const observed = Array.from(document.querySelectorAll('[data-scene], .panel'));
    if (observed.length) {
      const io = new IntersectionObserver(
        (entries) => {
          const best = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!best) return;
          applyFromSection(best.target);
        },
        { threshold: [0.25, 0.42, 0.6], rootMargin: '-20% 0px -55% 0px' }
      );
      observed.forEach((s) => io.observe(s));
    }
  }

  // ------------------------------------------------------------
  // Scroll vertical → movimiento horizontal (Proceso)
  // ------------------------------------------------------------

  const scrolly = document.querySelector('.scrolly');
  const track = document.getElementById('hTrack');
  const panels = track ? Array.from(track.querySelectorAll('.panel')) : [];
  const dotsEl = document.getElementById('scrollyDots');
  const labelEl = document.getElementById('scrollyLabel');

  let maxTranslate = 0;
  let enabledPinned = false;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setDots(active) {
    if (!dotsEl) return;
    const dots = Array.from(dotsEl.querySelectorAll('span'));
    dots.forEach((d, i) => d.classList.toggle('on', i === active));
    if (labelEl && panels[active]) {
      const t = panels[active].querySelector('.panelTitle')?.textContent?.trim() || '';
      labelEl.textContent = t || labelEl.textContent;
    }

    // Garantiza que el header/meta cambien incluso cuando los paneles se mueven por transform
    if (panels[active]) applyFromSection(panels[active]);
  }

  function buildDots() {
    if (!dotsEl || !panels.length) return;
    dotsEl.innerHTML = '';
    panels.forEach(() => {
      const s = document.createElement('span');
      dotsEl.appendChild(s);
    });
    setDots(0);
  }

  function measureScrolly() {
    if (!scrolly || !track) return;

    const small = window.innerWidth < 980;
    const reduce = prefersReducedMotion();
    const native = small || reduce;

    if (native) {
      enabledPinned = false;
      scrolly.setAttribute('data-mode', 'native');
      scrolly.style.height = '';
      track.style.transform = '';
      buildDots();
      return;
    }

    scrolly.setAttribute('data-mode', 'pinned');
    enabledPinned = true;

    // ancho total - viewport
    maxTranslate = Math.max(0, track.scrollWidth - window.innerWidth);
    // altura = viewport + desplazamiento horizontal
    scrolly.style.height = `${window.innerHeight + maxTranslate}px`;

    buildDots();
    onScrollScrolly();
  }

  function onScrollScrolly() {
    if (!enabledPinned || !scrolly || !track) return;
    const rect = scrolly.getBoundingClientRect();
    const start = window.scrollY + rect.top;
    const end = start + scrolly.offsetHeight - window.innerHeight;
    const y = window.scrollY;

    const t = (y - start) / Math.max(1, end - start);
    const p = Math.min(1, Math.max(0, t));
    const x = -p * maxTranslate;
    track.style.transform = `translate3d(${x}px,0,0)`;

    if (panels.length) {
      const idx = Math.min(panels.length - 1, Math.max(0, Math.round(p * (panels.length - 1))));
      setDots(idx);
    }
  }

  if (scrolly && track && panels.length) {
    window.addEventListener('resize', measureScrolly);
    window.addEventListener('scroll', onScrollScrolly, { passive: true });
    measureScrolly();
  }

  // ------------------------------------------------------------
  // Modal instalar (se conserva, pero luce claro)
  // ------------------------------------------------------------

  function platform() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    return { isIOS, isAndroid, isMobile: isIOS || isAndroid };
  }

  const overlay = document.getElementById('installOverlay');
  const closeBtn = document.getElementById('installClose');
  const titleEl = document.getElementById('installTitle');
  const introEl = document.getElementById('installIntro');
  const stepsEl = document.getElementById('installSteps');
  const qrBox = document.getElementById('qrBox');
  const qrUrl = document.getElementById('qrUrl');
  const qrCanvas = document.getElementById('qrCanvas');

  function addStep(n, text) {
    const div = document.createElement('div');
    div.className = 'step';
    div.innerHTML = `<div class="num">${n}</div><div>${text}</div>`;
    stepsEl.appendChild(div);
  }

  function openInstall() {
    if (!overlay) return;
    const p = platform();
    stepsEl.innerHTML = '';
    qrBox.hidden = true;

    if (p.isIOS) {
      titleEl.textContent = 'Instalar Logi en iPhone';
      introEl.textContent = 'Recomendado: Safari. Toma 20 segundos.';
      addStep(1, 'Toca el botón Compartir (cuadrado con flecha hacia arriba).');
      addStep(2, 'Selecciona “Agregar a pantalla de inicio”.');
      addStep(3, 'Confirma en “Agregar”.');
    } else if (p.isAndroid) {
      titleEl.textContent = 'Instalar Logi en Android';
      introEl.textContent = 'Recomendado: Chrome. Toma 15 segundos.';
      addStep(1, 'Abre esta página en Chrome.');
      addStep(2, 'Toca el menú ⋮ (arriba a la derecha).');
      addStep(3, 'Elige “Instalar app” o “Agregar a pantalla principal”.');
    } else {
      titleEl.textContent = 'Instalar Logi';
      introEl.textContent = 'En PC no se instala como app. Abre esta web en tu celular con el QR:';
      const url = window.location.href.replace(/#.*$/, '');
      qrUrl.textContent = url;
      qrBox.hidden = false;

      if (window.QRCode && qrCanvas) {
        window.QRCode.toCanvas(qrCanvas, url, { margin: 1, width: 170 }, function (err) {
          if (err) console.error(err);
        });
      }
    }

    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
  }

  function closeInstall() {
    if (!overlay) return;
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('[data-open-install]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e && e.preventDefault) e.preventDefault();
      openInstall();
    });
  });

  closeBtn?.addEventListener('click', closeInstall);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeInstall();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeInstall();
  });
})();
