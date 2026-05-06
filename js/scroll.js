/* =========================================================
   MarioBud — scroll.js
   GSAP ScrollTrigger: build sequence (pinned), services horizontal, timeline
   ========================================================= */

(function () {
  'use strict';

  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('GSAP not loaded — scroll animations disabled');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ============== BUILD SEQUENCE — pinned scroll ==============
  const buildSection = document.querySelector('.build');
  const buildPin = document.querySelector('.build-pin');
  const buildSvgEl = document.getElementById('build-svg');
  const stepEls = document.querySelectorAll('.build-steps li');
  const progressEl = document.querySelector('.build-progress-fill');

  function setLayer(svgDoc, sel, props) {
    const el = svgDoc.querySelector(sel);
    if (!el) return;
    Object.assign(el.style, props);
  }

  function initBuildSequence(svgDoc) {
    if (!buildSection || !buildPin || !svgDoc) return;

    // Stan początkowy — schowaj wszystko poza tłem
    const hide = (sel, opts = {}) => {
      const el = svgDoc.querySelector(sel);
      if (!el) return;
      gsap.set(el, { opacity: 0, transformOrigin: '50% 100%', ...opts });
    };
    const hideMany = (sel, opts = {}) => {
      svgDoc.querySelectorAll(sel).forEach(el => {
        gsap.set(el, { opacity: 0, ...opts });
      });
    };

    hide('.layer-excavation');
    hide('.layer-foundation', { scaleY: 0 });
    hideMany('.brick-row', { y: 20 });
    hide('.wall-edge-left'); hide('.wall-edge-right');
    hide('.layer-roof', { y: -80 });
    hide('.layer-attic-window');
    hide('.layer-chimney', { y: -40 });
    hide('.layer-door', { y: 30 });
    hideMany('.window', { y: 20 });
    hide('.layer-smoke');
    hide('.layer-porch-light');

    // koparka — startuje schowana z lewej
    const exc = svgDoc.querySelector('.layer-excavator');
    if (exc) gsap.set(exc, { x: 0, opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: buildSection,
        start: 'top top',
        end: '+=400%',
        scrub: 0.6,
        pin: buildPin,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressEl) progressEl.style.width = (self.progress * 100) + '%';
          // aktywny krok 0..3
          const idx = Math.min(3, Math.floor(self.progress * 4));
          stepEls.forEach((li, i) => li.classList.toggle('active', i === idx));
        }
      }
    });

    // Faza 1: koparka wjeżdża + wykop
    tl.to(svgDoc.querySelector('.layer-excavator'), {
      x: 460, duration: 1, ease: 'power1.inOut'
    }, 0);
    tl.to(svgDoc.querySelector('.layer-excavation'), {
      opacity: 1, duration: 0.4
    }, 0.6);
    tl.to(svgDoc.querySelector('.layer-excavator'), {
      x: 1500, duration: 0.8, ease: 'power1.in'
    }, 1.0);

    // Faza 2: fundament wylewa się od dołu
    tl.to(svgDoc.querySelector('.layer-foundation'), {
      opacity: 1, scaleY: 1, duration: 1, ease: 'power2.out',
      transformOrigin: '50% 100%'
    }, 1.4);

    // Faza 3: ściany — cegły rosną rzędami od dołu
    const rows = svgDoc.querySelectorAll('.brick-row');
    rows.forEach((row, i) => {
      tl.to(row, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 2.4 + i * 0.18);
    });
    tl.to([svgDoc.querySelector('.wall-edge-left'), svgDoc.querySelector('.wall-edge-right')],
      { opacity: 1, duration: 0.4 }, 3.5);
    tl.to(svgDoc.querySelector('.layer-door'), { opacity: 1, y: 0, duration: 0.5 }, 3.6);
    tl.to(svgDoc.querySelectorAll('.window'), { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, 3.7);

    // Faza 4: dach + komin + okno strychu
    tl.to(svgDoc.querySelector('.layer-roof'), {
      opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)'
    }, 4.2);
    tl.to(svgDoc.querySelector('.layer-attic-window'), { opacity: 1, duration: 0.4 }, 4.6);
    tl.to(svgDoc.querySelector('.layer-chimney'), {
      opacity: 1, y: 0, duration: 0.5
    }, 4.7);

    // Faza 5: wykończenie — światło w oknach + dym + lampa
    const winGlows = svgDoc.querySelectorAll('.window rect[fill*="window-glow"], .layer-attic-window polygon[fill*="window-glow"]');
    tl.to(winGlows, { opacity: 1, duration: 0.6, stagger: 0.1 }, 5.0);
    tl.to(svgDoc.querySelector('.layer-porch-light'), { opacity: 1, duration: 0.5 }, 5.1);
    tl.to(svgDoc.querySelector('.layer-smoke'), { opacity: 1, duration: 0.6 }, 5.3);
  }

  function waitForSvg(obj, cb) {
    if (!obj) return;
    const tryInit = () => {
      const doc = obj.contentDocument;
      if (doc && doc.readyState === 'complete' && doc.querySelector('.layer-roof')) {
        cb(doc);
      } else {
        setTimeout(tryInit, 100);
      }
    };
    if (obj.contentDocument && obj.contentDocument.querySelector && obj.contentDocument.querySelector('.layer-roof')) {
      cb(obj.contentDocument);
    } else {
      obj.addEventListener('load', () => cb(obj.contentDocument));
      setTimeout(tryInit, 600);
    }
  }

  waitForSvg(buildSvgEl, initBuildSequence);

  // ============== SERVICES — horizontal scroll ==============
  const servicesSection = document.querySelector('.services');
  const track = document.getElementById('services-track');
  if (servicesSection && track) {
    const setupHorizontal = () => {
      const scrollDistance = track.scrollWidth - window.innerWidth + 80;
      if (scrollDistance <= 0) return;
      gsap.to(track, {
        x: -scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger: servicesSection,
          start: 'top top',
          end: '+=' + scrollDistance,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });
    };
    if (window.matchMedia('(min-width: 980px)').matches) {
      setupHorizontal();
    }
  }

  // ============== TIMELINE — rysująca się linia + active steps ==============
  const timeline = document.querySelector('.timeline');
  const timelineLine = document.querySelector('.timeline-line::before');
  const tSteps = document.querySelectorAll('.t-step');
  if (timeline && tSteps.length) {
    const lineFill = document.querySelector('.timeline-line');
    if (lineFill) {
      gsap.to(lineFill, {
        '--fill': 1,
        scrollTrigger: {
          trigger: timeline,
          start: 'top 70%',
          end: 'bottom 60%',
          scrub: 0.5,
          onUpdate: (self) => {
            // animacja ::before scaleY
            lineFill.style.setProperty('--scaleY', self.progress);
            const before = lineFill;
            // bezpośrednia animacja przez inline style na pseudo nie zadziała,
            // więc używamy CSS variable + odpowiedniego stylu
          }
        }
      });
    }

    // Active step gdy w viewport
    tSteps.forEach((step, i) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 75%',
        end: 'bottom 25%',
        toggleClass: { targets: step, className: 'active' },
      });
    });

    // Progress linii — bezpośrednio na elemencie
    const lineEl = document.querySelector('.timeline-line');
    if (lineEl) {
      ScrollTrigger.create({
        trigger: timeline,
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 0.5,
        onUpdate: (self) => {
          lineEl.style.setProperty('--p', self.progress);
        }
      });
    }
  }

  // ============== Refresh on resize ==============
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });

})();
