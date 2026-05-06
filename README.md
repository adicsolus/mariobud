# MarioBud — strona-prezent 🛠️

Niespodzianka dla Mariusza. Jednostronicowy landing page firmy budowlanej w stylu premium — animowany scroll, pinned build sequence (dom buduje się gdy scrollujesz), horizontal-scroll usług, mapa realizacji, opinie, formularz wyceny.

## Co to jest

Draft strony głównej (treści można podmienić). Wszystko statyczne — czysty HTML/CSS/JS, bez build stepu. Hostowane na GitHub Pages.

## Stack

- **HTML/CSS/JS** — vanilla, bez frameworków
- **GSAP + ScrollTrigger** (CDN) — pinned scroll i horizontal scroll
- **Lenis** (CDN) — smooth scroll
- **vanilla-tilt** (CDN) — tilt na kartach realizacji
- **Google Fonts** — Archivo + Inter
- **Unsplash** — placeholdery zdjęć

## Uruchomienie lokalne

```bash
cd mariobud
python3 -m http.server 8000
# otwórz http://localhost:8000
```

> ⚠️ Trzeba uruchomić przez serwer (nie z `file://`), bo `<object>` z SVG i animacje na warstwach SVG wymagają same-origin.

## Struktura

```
mariobud/
├── index.html
├── css/
│   ├── styles.css         # design system
│   └── animations.css     # @keyframes
├── js/
│   ├── main.js            # nav, smooth scroll, magnetic, parallax, tilt, mapa
│   ├── scroll.js          # GSAP ScrollTrigger sceny
│   ├── counters.js        # animowane liczniki
│   └── easter-eggs.js     # konami, klik-w-logo, console
├── assets/
│   ├── logo.svg
│   ├── logo-mark.svg
│   ├── house-build.svg
│   └── poland-map.svg
└── README.md
```

## Easter eggi

1. Najedź myszą na słowo **"konkret"** w hero — zamieni się na "beton".
2. Wpisz **Konami code** (↑↑↓↓←→←→BA) — koparka przejedzie przez ekran.
3. Kliknij **5× w logo** — zatrzęsie się jak po uderzeniu młotkiem.
4. Otwórz **konsolę przeglądarki** — czeka tam ASCII-art wiadomość.

## Co podmienić zanim Mariusz to zobaczy lub przed prawdziwym uruchomieniem

- Telefon w hero / CTA / footer (`+48 600 000 000`)
- E-mail (`biuro@mariobud.pl`)
- Adres
- NIP
- Ceny w kartach usług (placeholder!)
- Liczby w sekcji statystyk
- Linki w stopce
