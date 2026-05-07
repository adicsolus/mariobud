/* =========================================================
   MarioBud — scroll.js
   GSAP ScrollTrigger:
   - build sequence: pin .build-pin (pinType: transform) na desktop i mobile
   - services: horizontal scroll z pinem tylko na desktop (mobile = grid 1col)
   - timeline procesu: rysująca się linia + active steps
   ========================================================= */

(function () {
  'use strict';

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('[MarioBud] GSAP not loaded — scroll animations disabled');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // pinType: transform globalnie — kluczowe dla działania w obie strony
  // na mobile (gdzie position:fixed konfliktuje z mobile Safari toolbarem)
  ScrollTrigger.config({ ignoreMobileResize: true });
  ScrollTrigger.defaults({ pinType: 'transform' });

  let buildInited = false;
  let servicesInited = false;

  const isDesktop = () => window.matchMedia('(min-width: 980px)').matches;

  // ============== BUILD SEQUENCE — pin + scrub ==============
  function initBuildSequence() {
    if (buildInited) return;
    const buildSection = document.querySelector('.build');
    const buildPin = document.querySelector('.build-pin');
    const buildSvgHost = document.getElementById('build-svg-host');
    const stepEls = document.querySelectorAll('.build-steps li');
    const progressEl = document.querySelector('.build-progress-fill');
    if (!buildSection || !buildPin || !buildSvgHost) return;
    const svg = buildSvgHost.querySelector('svg');
    if (!svg) return;
    if (!svg.querySelector('.layer-roof')) return;
    buildInited = true;

    const q = (sel) => svg.querySelector(sel);
    const qa = (sel) => svg.querySelectorAll(sel);

    // STAN POCZĄTKOWY — wszystko schowane (dom-działka)
    gsap.set(q('.layer-excavation'), { opacity: 0 });
    gsap.set(q('.layer-foundation'), { opacity: 0, scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(qa('.brick-row'), { opacity: 0, y: 20 });
    gsap.set([q('.wall-edge-left'), q('.wall-edge-right')], { opacity: 0 });
    gsap.set(q('.layer-roof'), { opacity: 0, y: -80 });
    gsap.set(q('.layer-attic-window'), { opacity: 0 });
    gsap.set(q('.layer-chimney'), { opacity: 0, y: -40 });
    gsap.set(q('.layer-door'), { opacity: 0, y: 30 });
    gsap.set(qa('.window'), { opacity: 0 });  // bez y — okna mają fixed x/y w SVG
    gsap.set(q('.layer-smoke'), { opacity: 0 });
    gsap.set(q('.layer-porch-light'), { opacity: 0 });
    const exc = q('.layer-excavator');
    if (exc) gsap.set(exc, { x: 0, opacity: 1 });

    // Timeline z pin'em — sekcja .build pinuje .build-pin na czas animacji
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: buildSection,
        start: 'top top',
        end: '+=200%',          // 2× viewport scrolla na 5-fazową animację
        scrub: 0.5,
        pin: buildPin,
        pinSpacing: true,
        pinType: 'transform',
        anticipatePin: 1,
        invalidateOnRefresh: true,
        fastScrollEnd: true,
        onUpdate: (self) => {
          if (progressEl) progressEl.style.width = (self.progress * 100) + '%';
          // Aktywny krok 0-3 na bazie progresu
          const idx = Math.min(3, Math.floor(self.progress * 4));
          stepEls.forEach((li, i) => li.classList.toggle('active', i === idx));
        }
      }
    });

    // FAZA 1: koparka wjeżdża, robi wykop, znika z prawej (0 - 1.4s)
    tl.to(q('.layer-excavator'), { x: 460, duration: 1, ease: 'power1.inOut' }, 0)
      .to(q('.layer-excavation'), { opacity: 1, duration: 0.4 }, 0.6)
      .to(q('.layer-excavator'), { x: 1500, duration: 0.8, ease: 'power1.in' }, 1.0);

    // FAZA 2: fundament wylewa się (1.4 - 2.4s)
    tl.to(q('.layer-foundation'), {
      opacity: 1, scaleY: 1, duration: 1, ease: 'power2.out'
    }, 1.4);

    // FAZA 3: ściany rosną cegła po cegle (2.4 - 4.0s)
    qa('.brick-row').forEach((row, i) => {
      tl.to(row, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 2.4 + i * 0.18);
    });
    tl.to([q('.wall-edge-left'), q('.wall-edge-right')], { opacity: 1, duration: 0.4 }, 3.5)
      .to(q('.layer-door'), { opacity: 1, y: 0, duration: 0.5 }, 3.6)
      .to(qa('.window'), { opacity: 1, duration: 0.5, stagger: 0.15 }, 3.7);

    // FAZA 4: dach + komin (4.2 - 5.0s)
    tl.to(q('.layer-roof'), {
      opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)'
    }, 4.2)
      .to(q('.layer-attic-window'), { opacity: 1, duration: 0.4 }, 4.6)
      .to(q('.layer-chimney'), { opacity: 1, y: 0, duration: 0.5 }, 4.7);

    // FAZA 5: wykończenie — światło + dym + lampa (5.0 - 6.0s)
    const winGlows = svg.querySelectorAll('.window rect[fill*="window-glow"], .layer-attic-window polygon[fill*="window-glow"]');
    tl.to(winGlows, { opacity: 1, duration: 0.6, stagger: 0.1 }, 5.0)
      .to(q('.layer-porch-light'), { opacity: 1, duration: 0.5 }, 5.1)
      .to(q('.layer-smoke'), { opacity: 1, duration: 0.6 }, 5.3);
  }

  // ============== SERVICES — horizontal scroll (tylko desktop) ==============
  function initServicesHorizontal() {
    if (servicesInited) return;
    if (!isDesktop()) return;
    const section = document.querySelector('.services');
    const track = document.getElementById('services-track');
    if (!section || !track) return;
    servicesInited = true;

    // Funkcja liczy dystans dynamicznie (po refresh)
    const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);

    gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + getDistance(),
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
        pinType: 'transform',
        anticipatePin: 1,
        invalidateOnRefresh: true,
        fastScrollEnd: true,
      }
    });
  }

  // ============== TIMELINE procesu ==============
  function initTimeline() {
    const timeline = document.querySelector('.timeline');
    const tSteps = document.querySelectorAll('.t-step');
    if (!timeline || !tSteps.length) return;
    const lineEl = document.querySelector('.timeline-line');
    if (lineEl) {
      ScrollTrigger.create({
        trigger: timeline,
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => lineEl.style.setProperty('--p', self.progress)
      });
    }
    tSteps.forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 75%',
        end: 'bottom 25%',
        toggleClass: { targets: step, className: 'active' },
        invalidateOnRefresh: true,
      });
    });
  }

  function bootAll() {
    initBuildSequence();
    initServicesHorizontal();
    initTimeline();
    // refresh po inicie żeby wszystkie pozycje były naliczone na nowo
    setTimeout(() => ScrollTrigger.refresh(), 100);
  }

  // Główny boot — gdy SVG-i już wstrzyknięte do DOM
  window.addEventListener('mariobud:svgs-ready', bootAll);

  // Fallback: gdyby event nigdy nie nadszedł
  window.addEventListener('load', () => {
    setTimeout(bootAll, 300);
    setTimeout(() => ScrollTrigger.refresh(), 800);
  });

  // Refresh po załadowaniu czcionek (kluczowe — czcionki zmieniają wymiary
  // tekstu i layout, ScrollTrigger musi przeliczyć pozycje)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      setTimeout(() => ScrollTrigger.refresh(), 100);
    });
  }

  // Refresh on resize / orientation change — re-init services horizontal
  // jeśli przeszliśmy między mobile a desktop
  let resizeTimer;
  let lastIsDesktop = isDesktop();
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nowDesktop = isDesktop();
      if (nowDesktop !== lastIsDesktop) {
        // breakpoint przekroczony — kill wszystkie ST i odpal od nowa
        ScrollTrigger.getAll().forEach(st => st.kill());
        buildInited = false;
        servicesInited = false;
        lastIsDesktop = nowDesktop;
        bootAll();
      } else {
        ScrollTrigger.refresh();
      }
    }, 200);
  });

})();
