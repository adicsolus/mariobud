/* =========================================================
   MarioBud — counters.js
   Animowane liczniki w sekcji statystyk
   ========================================================= */

(function () {
  'use strict';

  const stats = document.querySelectorAll('.stat');
  if (!stats.length) return;

  const animateCount = (el, target, suffix = '') => {
    const numEl = el.querySelector('.stat-num');
    if (!numEl) return;
    const duration = 1800;
    const start = performance.now();
    const startVal = 0;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      const value = Math.round(startVal + (target - startVal) * eased);
      numEl.textContent = value.toLocaleString('pl-PL') + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || '';
      animateCount(el, target, suffix);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });

  stats.forEach(s => io.observe(s));

})();
