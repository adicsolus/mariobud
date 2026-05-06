/* =========================================================
   MarioBud — main.js
   Inicjalizacja: smooth scroll, nav, magnetic CTA, parallax, swap-word, tilt, mapa
   ========================================================= */

(function () {
  'use strict';

  // -------- Smooth scroll (Lenis) --------
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    window.__lenis = lenis;

    // Spinka z GSAP ScrollTrigger
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  // -------- Nav: scrolled state + mobile burger --------
  const nav = document.getElementById('nav');
  const burger = document.querySelector('.nav-burger');
  const navLinks = document.querySelector('.nav-links');

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', (e) => {
      if (e.target.matches('a')) navLinks.classList.remove('open');
    });
  }

  // smooth scroll na linki anchor (gdy Lenis aktywny)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -60, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // -------- Magnetic CTA --------
  document.querySelectorAll('.magnetic').forEach(el => {
    const strength = 18;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${(x / r.width) * strength}px, ${(y / r.height) * strength}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });

  // -------- Hero parallax na chmury (mouse) --------
  const heroBg = document.querySelector('.hero-clouds');
  const hero = document.querySelector('.hero');
  if (hero && heroBg) {
    hero.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      heroBg.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  // -------- Swap word (hero "konkret" <-> "beton") --------
  document.querySelectorAll('[data-swap]').forEach(el => {
    const original = el.textContent;
    const swap = el.dataset.swap;
    let toggled = false;
    el.addEventListener('mouseenter', () => {
      if (toggled) return;
      toggled = true;
      el.style.transition = 'opacity 0.15s';
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = swap;
        el.style.opacity = '1';
      }, 150);
    });
    el.addEventListener('mouseleave', () => {
      if (!toggled) return;
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = original;
        el.style.opacity = '1';
        toggled = false;
      }, 150);
    });
  });

  // -------- Vanilla tilt na karty galerii --------
  if (window.VanillaTilt) {
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
      max: 6,
      speed: 600,
      glare: true,
      'max-glare': 0.18,
      perspective: 1200,
    });
  }

  // -------- Reveal on scroll (IntersectionObserver) --------
  const revealEls = document.querySelectorAll(
    '.services-head, .process-head, .gallery-head, .map-head, .reviews-head, .stat, .t-step, .g-card'
  );
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 3 === 1) el.classList.add('delay-1');
    if (i % 3 === 2) el.classList.add('delay-2');
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
  revealEls.forEach(el => io.observe(el));

  // -------- Mapa Polski: tooltipy + animacja pinów --------
  const mapObj = document.getElementById('poland-map');
  const tooltip = document.getElementById('map-tooltip');

  function setupMap() {
    if (!mapObj || !tooltip) return;
    const doc = mapObj.contentDocument;
    if (!doc) return;
    const pins = doc.querySelectorAll('.map-pin');
    const wrap = mapObj.parentElement;

    // animacja stagger pojawiania się pinów
    pins.forEach((pin, i) => {
      pin.style.opacity = '0';
      pin.style.transform = pin.getAttribute('transform') + ' translate(0,-20px)';
    });

    const mapIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          pins.forEach((pin, i) => {
            const original = pin.getAttribute('transform');
            setTimeout(() => {
              pin.style.transition = 'opacity 0.5s ease, transform 0.6s cubic-bezier(.22,.61,.36,1)';
              pin.style.opacity = '1';
              pin.style.transform = original;
            }, i * 110);
          });
          mapIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    mapIO.observe(mapObj);

    // tooltipy
    pins.forEach(pin => {
      pin.addEventListener('mouseenter', (e) => {
        const city = pin.dataset.city || '';
        const tip = pin.dataset.tip || '';
        tooltip.querySelector('strong').textContent = city;
        tooltip.querySelector('span').textContent = tip;
        tooltip.classList.add('show');
      });
      pin.addEventListener('mousemove', (e) => {
        // pozycja pinu w ramach SVG → przekładamy na koordynaty wrapa
        const svgEl = mapObj;
        const rect = svgEl.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        // używamy bbox pinu w SVG
        const bbox = pin.getBoundingClientRect();
        const x = bbox.left + bbox.width / 2 - wrapRect.left;
        const y = bbox.top - wrapRect.top - 8;
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
      });
      pin.addEventListener('mouseleave', () => {
        tooltip.classList.remove('show');
      });
    });
  }
  if (mapObj) {
    if (mapObj.contentDocument && mapObj.contentDocument.readyState === 'complete') {
      setupMap();
    } else {
      mapObj.addEventListener('load', setupMap);
    }
  }

  // -------- Floating-label fix (input wymagają placeholder) --------
  document.querySelectorAll('.field input, .field textarea').forEach(el => {
    if (!el.hasAttribute('placeholder')) el.setAttribute('placeholder', ' ');
  });

})();
