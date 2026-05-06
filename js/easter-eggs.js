/* =========================================================
   MarioBud — easter-eggs.js
   Konami code, console art, klik 5x w logo, "konkret/beton" swap
   ========================================================= */

(function () {
  'use strict';

  // -------- Console ASCII art --------
  const houseArt = `
        /\\
       /  \\
      /    \\
     /______\\
     |  __  |
     | |  | |
     |_|__|_|

  Cześć Mariusz! 👷
  Zajrzałeś w devtoolsy — wiedziałem.
  Strona zbudowana ręcznie przez kumpla. Niespodzianka 🎁
  Jak coś chcesz zmienić — pisz, pomogę.
`;
  console.log('%c' + houseArt, 'color:#FFD23F; background:#1A1D24; font-family:monospace; padding:8px;');
  console.log('%c💡 Easter egg #1:', 'color:#ff6b3d; font-weight:bold;', 'spróbuj wpisać Konami code: ↑↑↓↓←→←→BA');
  console.log('%c💡 Easter egg #2:', 'color:#ff6b3d; font-weight:bold;', 'kliknij 5x w logo');
  console.log('%c💡 Easter egg #3:', 'color:#ff6b3d; font-weight:bold;', 'najedź na słowo "konkret" w hero');

  // -------- Konami code → koparka przejeżdża przez ekran --------
  const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let progress = 0;
  let cooldown = false;

  const triggerKonami = () => {
    if (cooldown) return;
    cooldown = true;
    const exc = document.createElement('div');
    exc.className = 'konami-excavator';
    exc.innerHTML = `
      <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="40" width="120" height="40" rx="4" fill="#FFD23F"/>
        <rect x="40" y="10" width="60" height="35" rx="3" fill="#FFD23F"/>
        <rect x="50" y="18" width="40" height="20" fill="#1A1D24" opacity="0.7"/>
        <circle cx="40" cy="85" r="14" fill="#1A1D24"/>
        <circle cx="40" cy="85" r="6" fill="#5e6469"/>
        <circle cx="80" cy="85" r="14" fill="#1A1D24"/>
        <circle cx="80" cy="85" r="6" fill="#5e6469"/>
        <circle cx="120" cy="85" r="14" fill="#1A1D24"/>
        <circle cx="120" cy="85" r="6" fill="#5e6469"/>
        <line x1="100" y1="20" x2="180" y2="60" stroke="#FFD23F" stroke-width="10" stroke-linecap="round"/>
        <path d="M 175 55 L 195 55 L 200 75 L 175 70 Z" fill="#1A1D24"/>
      </svg>
    `;
    document.body.appendChild(exc);
    // toast
    const toast = document.createElement('div');
    toast.textContent = '🚜 Konami! Mariusz wjeżdża na plac.';
    toast.style.cssText = `
      position:fixed; top:80px; left:50%; transform:translateX(-50%);
      background:#1A1D24; color:#FFD23F; padding:0.8rem 1.4rem;
      border-radius:999px; font-family:Archivo,sans-serif; font-weight:700;
      box-shadow:0 10px 40px rgba(0,0,0,0.3); z-index:1000;
      animation:rise 0.5s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => exc.remove(), 6500);
    setTimeout(() => toast.remove(), 4000);
    setTimeout(() => { cooldown = false; }, 7000);
  };

  document.addEventListener('keydown', (e) => {
    const expected = sequence[progress];
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === expected.toLowerCase()) {
      progress++;
      if (progress === sequence.length) {
        triggerKonami();
        progress = 0;
      }
    } else {
      progress = (key === sequence[0].toLowerCase()) ? 1 : 0;
    }
  });

  // -------- Klik 5x w logo --------
  const logo = document.querySelector('.nav-logo');
  if (logo) {
    let clicks = 0;
    let timer = null;
    logo.addEventListener('click', (e) => {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => { clicks = 0; }, 1500);
      if (clicks >= 5) {
        clicks = 0;
        e.preventDefault();
        logo.classList.add('shake');
        // mini toast
        const t = document.createElement('div');
        t.textContent = '🔨 Auć! Po co tak walisz w logo?';
        t.style.cssText = `
          position:fixed; top:80px; left:50%; transform:translateX(-50%);
          background:#FFD23F; color:#1A1D24; padding:0.7rem 1.2rem;
          border-radius:999px; font-family:Archivo,sans-serif; font-weight:700;
          box-shadow:0 10px 40px rgba(0,0,0,0.2); z-index:1000;
        `;
        document.body.appendChild(t);
        setTimeout(() => logo.classList.remove('shake'), 500);
        setTimeout(() => t.remove(), 2500);
      }
    });
  }

})();
