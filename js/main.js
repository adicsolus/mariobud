/* =========================================================
   MarioBud — main.js
   SVG inliner, smooth scroll, nav, magnetic CTA, parallax, swap-word, tilt, mapa
   ========================================================= */

(function () {
  'use strict';

  // -------- SVG inliner: ładuje pliki SVG i wkłada je bezpośrednio do DOM --------
  // Dzięki temu GSAP/JS ma natychmiastowy dostęp do warstw bez problemów contentDocument.
  async function inlineSvg(host) {
    const url = host.getAttribute('data-src');
    if (!url) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      host.innerHTML = text;
      const svg = host.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.maxWidth = '100%';
        svg.style.maxHeight = '100%';
        svg.style.display = 'block';
      }
    } catch (e) {
      console.warn('[MarioBud] inlineSvg failed for', url, e);
    }
  }

  async function inlineAllSvgs() {
    const hosts = document.querySelectorAll('[data-src]');
    await Promise.all([...hosts].map(inlineSvg));
    window.dispatchEvent(new CustomEvent('mariobud:svgs-ready'));
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  // Każdy <img> który dopiero się załaduje pcha layout, więc po każdym
  // ScrollTrigger musi przeliczyć pozycje pin'ów / triggerów.
  function refreshOnImageLoads() {
    if (!window.ScrollTrigger) return;
    const imgs = document.querySelectorAll('img');
    let pending = 0;
    imgs.forEach(img => {
      if (img.complete) return;
      pending++;
      img.addEventListener('load', () => { ScrollTrigger.refresh(); }, { once: true });
      img.addEventListener('error', () => { ScrollTrigger.refresh(); }, { once: true });
    });
    // jeszcze raz po pełnym window load (czcionki, late requests)
    window.addEventListener('load', () => {
      setTimeout(() => ScrollTrigger.refresh(), 200);
      setTimeout(() => ScrollTrigger.refresh(), 800);
    });
  }
  refreshOnImageLoads();

  // odpal inliner najwcześniej
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inlineAllSvgs);
  } else {
    inlineAllSvgs();
  }

  // Smooth scroll: używamy natywnego (Safari/Chrome są superpłynne).
  // CSS html { scroll-behavior: smooth } robi resztę dla anchor links.

  // -------- Nav: scrolled state + mobile burger --------
  const nav = document.getElementById('nav');
  const burger = document.querySelector('.nav-burger');
  const navLinks = document.querySelector('.nav-links');

  const progressFill = document.querySelector('.scroll-progress-fill');
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
    if (progressFill) {
      const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      progressFill.style.width = pct + '%';
    }
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

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: 'smooth' });
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
      setTimeout(() => { el.textContent = swap; el.style.opacity = '1'; }, 150);
    });
    el.addEventListener('mouseleave', () => {
      if (!toggled) return;
      el.style.opacity = '0';
      setTimeout(() => { el.textContent = original; el.style.opacity = '1'; toggled = false; }, 150);
    });
  });

  // -------- Vanilla tilt na karty galerii --------
  if (window.VanillaTilt) {
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
      max: 6, speed: 600, glare: true, 'max-glare': 0.18, perspective: 1200,
    });
  }

  // -------- Reveal on scroll --------
  const revealEls = document.querySelectorAll(
    '.services-head, .process-head, .gallery-head, .map-head, .reviews-head, .stat, .t-step, .g-card, .service-card, .service-end'
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
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  revealEls.forEach(el => {
    io.observe(el);
    // jeśli element JEST już w viewport przy bootcie (np. user reload'uje
    // w środku strony), nie czekaj na IO — od razu dodaj .in
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.95 && r.bottom > 0) el.classList.add('in');
  });

  // Bezpiecznik: po pełnym window.load wszystko co jeszcze nie ma .in,
  // ale jest w viewport, dostaje .in. Ostatnia szansa, żeby nic nie zostało
  // niewidoczne (np. jeśli IO miałby pecha z timing'iem).
  window.addEventListener('load', () => {
    setTimeout(() => {
      revealEls.forEach(el => {
        if (el.classList.contains('in')) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
      });
    }, 600);
  });

  // -------- Mapa Polski: tooltipy + animacja pinów --------
  function setupMap() {
    const mapHost = document.getElementById('poland-map');
    const tooltip = document.getElementById('map-tooltip');
    if (!mapHost || !tooltip) return;
    const pins = mapHost.querySelectorAll('.map-pin');
    if (!pins.length) return;
    const wrap = mapHost.parentElement;

    pins.forEach((pin) => {
      const original = pin.getAttribute('transform') || '';
      pin.style.opacity = '0';
      pin.style.transformBox = 'fill-box';
      pin.style.transformOrigin = 'center bottom';
    });

    const mapIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          pins.forEach((pin, i) => {
            setTimeout(() => {
              pin.style.transition = 'opacity 0.5s ease';
              pin.style.opacity = '1';
            }, i * 110);
          });
          mapIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    mapIO.observe(mapHost);

    pins.forEach(pin => {
      pin.style.cursor = 'pointer';
      pin.addEventListener('mouseenter', () => {
        const city = pin.getAttribute('data-city') || '';
        const tip = pin.getAttribute('data-tip') || '';
        tooltip.querySelector('strong').textContent = city;
        tooltip.querySelector('span').textContent = tip;
        tooltip.classList.add('show');
      });
      pin.addEventListener('mousemove', () => {
        const wrapRect = wrap.getBoundingClientRect();
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
  window.addEventListener('mariobud:svgs-ready', setupMap);

  // -------- Floating-label fix --------
  document.querySelectorAll('.field input, .field textarea').forEach(el => {
    if (!el.hasAttribute('placeholder')) el.setAttribute('placeholder', ' ');
  });

})();
