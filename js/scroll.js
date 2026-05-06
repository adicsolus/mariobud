/* =========================================================
   MarioBud — scroll.js
   GSAP ScrollTrigger: build sequence (pinned), services horizontal, timeline
   ========================================================= */

(function () {
  'use strict';

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('[MarioBud] GSAP not loaded — scroll animations disabled');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  let initialized = false;

  function initBuildSequence() {
    if (initialized) return;
    const buildSection = document.querySelector('.build');
    const buildSvgHost = document.getElementById('build-svg-host');
    const stepEls = document.querySelectorAll('.build-steps li');
    const progressEl = document.querySelector('.build-progress-fill');
    if (!buildSection || !buildSvgHost) return;
    const svg = buildSvgHost.querySelector('svg');
    if (!svg) return;
    if (!svg.querySelector('.layer-roof')) return;
    initialized = true;

    const q = (sel) => svg.querySelector(sel);
    const qa = (sel) => svg.querySelectorAll(sel);

    // Stan początkowy
    gsap.set(q('.layer-excavation'), { opacity: 0 });
    gsap.set(q('.layer-foundation'), { opacity: 0, scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(qa('.brick-row'), { opacity: 0, y: 20 });
    gsap.set([q('.wall-edge-left'), q('.wall-edge-right')], { opacity: 0 });
    gsap.set(q('.layer-roof'), { opacity: 0, y: -80 });
    gsap.set(q('.layer-attic-window'), { opacity: 0 });
    gsap.set(q('.layer-chimney'), { opacity: 0, y: -40 });
    gsap.set(q('.layer-door'), { opacity: 0, y: 30 });
    gsap.set(qa('.window'), { opacity: 0, y: 20 });
    gsap.set(q('.layer-smoke'), { opacity: 0 });
    gsap.set(q('.layer-porch-light'), { opacity: 0 });
    const exc = q('.layer-excavator');
    if (exc) gsap.set(exc, { x: 0, opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: buildSection,
        start: 'top top',
        end: '+=180%',
        scrub: 0.4,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressEl) progressEl.style.width = (self.progress * 100) + '%';
          const idx = Math.min(3, Math.floor(self.progress * 4));
          stepEls.forEach((li, i) => li.classList.toggle('active', i === idx));
        }
      }
    });

    // Faza 1: koparka + wykop
    tl.to(q('.layer-excavator'), { x: 460, duration: 1, ease: 'power1.inOut' }, 0)
      .to(q('.layer-excavation'), { opacity: 1, duration: 0.4 }, 0.6)
      .to(q('.layer-excavator'), { x: 1500, duration: 0.8, ease: 'power1.in' }, 1.0);

    // Faza 2: fundament
    tl.to(q('.layer-foundation'), {
      opacity: 1, scaleY: 1, duration: 1, ease: 'power2.out'
    }, 1.4);

    // Faza 3: ściany
    qa('.brick-row').forEach((row, i) => {
      tl.to(row, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 2.4 + i * 0.18);
    });
    tl.to([q('.wall-edge-left'), q('.wall-edge-right')], { opacity: 1, duration: 0.4 }, 3.5)
      .to(q('.layer-door'), { opacity: 1, y: 0, duration: 0.5 }, 3.6)
      .to(qa('.window'), { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, 3.7);

    // Faza 4: dach + komin
    tl.to(q('.layer-roof'), {
      opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)'
    }, 4.2)
      .to(q('.layer-attic-window'), { opacity: 1, duration: 0.4 }, 4.6)
      .to(q('.layer-chimney'), { opacity: 1, y: 0, duration: 0.5 }, 4.7);

    // Faza 5: wykończenie
    const winGlows = svg.querySelectorAll('.window rect[fill*="window-glow"], .layer-attic-window polygon[fill*="window-glow"]');
    tl.to(winGlows, { opacity: 1, duration: 0.6, stagger: 0.1 }, 5.0)
      .to(q('.layer-porch-light'), { opacity: 1, duration: 0.5 }, 5.1)
      .to(q('.layer-smoke'), { opacity: 1, duration: 0.6 }, 5.3);

    setTimeout(() => ScrollTrigger.refresh(), 100);
  }

  // ---- Services horizontal ----
  function initServicesHorizontal() {
    const servicesSection = document.querySelector('.services');
    const track = document.getElementById('services-track');
    if (!servicesSection || !track) return;
    if (!window.matchMedia('(min-width: 980px)').matches) return;
    const scrollDistance = track.scrollWidth - window.innerWidth + 80;
    if (scrollDistance <= 0) return;
    // krótszy pin: użytkownik scrolluje 1.2x dystansu poziomego (mniej "uwięziony")
    gsap.to(track, {
      x: -scrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: servicesSection,
        start: 'top top',
        end: '+=' + Math.round(scrollDistance * 1.0),
        scrub: 0.4,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });
  }

  // ---- Timeline progress + active steps ----
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
        onUpdate: (self) => lineEl.style.setProperty('--p', self.progress)
      });
    }
    tSteps.forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 75%',
        end: 'bottom 25%',
        toggleClass: { targets: step, className: 'active' },
      });
    });
  }

  function bootAll() {
    initBuildSequence();
    initServicesHorizontal();
    initTimeline();
  }

  // Główny boot — gdy SVG-i już wstrzyknięte
  window.addEventListener('mariobud:svgs-ready', bootAll);

  // Fallback: gdyby event nigdy nie nadszedł, spróbuj po load
  window.addEventListener('load', () => {
    setTimeout(bootAll, 500);
    setTimeout(() => ScrollTrigger.refresh(), 800);
  });

  // Refresh on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });

})();
