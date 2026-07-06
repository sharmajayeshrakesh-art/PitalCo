# PittalCo — Living Brass

A cinematic, editorial, award-grade website for **PittalCo** — handcrafted pure-brass
heirloom objects, made in India. *Where tradition meets elegance.*

The experience is built around a bespoke art direction — **living brass on warm ink** —
with custom-drawn brass objects (kalash, diya, urli, deep stambh) instead of stock
photography, so the site reads as a considered luxury house rather than a template.

---

## Highlights

- **Sophisticated preloader** — the emblem draws itself, a counter runs to 100, then
  slatted ink panels lift to unveil the page.
- **Cinematic scroll** — smooth scrolling (Lenis) synced to GSAP ScrollTrigger.
- **Scroll-triggered storytelling** — masked line-by-line text reveals, word-by-word
  colour reveals, elegant image clip-reveals, and layered parallax depth.
- **Pinned horizontal "Craft" section** — the five-step making process scrolls sideways
  while pinned, with a live progress bar (a touch-scrollable rail on mobile).
- **Metallic reflections** — a scroll-driven brass sheen sweeps the philosophy section;
  accent words carry a slow living shimmer.
- **Micro-interactions** — magnetic buttons, a custom brass cursor, hover sheens on
  product cards, animated counters.
- **Editorial layout** — asymmetric product grid, large whitespace, a high-contrast
  Fraunces / Inter type hierarchy.
- **Built to last** — self-hosted fonts and libraries (no third-party CDN calls),
  reduced-motion support, semantic structure, JSON-LD, Open Graph, and graceful
  no-JS fallback.

---

## Structure

```
index.html                 # Single-page experience, semantic + SEO metadata
assets/
  css/style.css            # Design tokens + all styling (sectioned & commented)
  js/main.js               # Motion layer (GSAP + Lenis), opt-in via data-attributes
  fonts/                   # Self-hosted Fraunces (variable) + Inter woff2
  vendor/                  # Self-hosted gsap, ScrollTrigger, lenis
  img/
    favicon.svg
    logo-mark.svg          # Emblem only
    logo-primary.svg       # Full lockup (brass) — web / dark backgrounds
    logo-mono.svg          # Single-colour lockup — for boxes, embossing & foil
```

## Running locally

No build step. Serve the folder with any static server:

```bash
python3 -m http.server 8099
# then open http://127.0.0.1:8099
```

Deploy the repository as-is to any static host (Netlify, Vercel, GitHub Pages, S3…).

## Brand assets & the logo

The logo is a minimal, embossable mark: a flame rising from a *diya* bowl inside a
medallion, paired with a letter-spaced **PITTALCO** wordmark and a *SINCE 2026* tagline.

- **`logo-primary.svg`** — brass, for the site and dark backgrounds.
- **`logo-mono.svg`** — one colour via `currentColor`; ideal for stamping, embossing,
  debossing or foiling on packaging. Set the colour to gold, black or white as needed.

## Editing content

Copy lives directly in `index.html`. Animations are attached via `data-*` attributes
(`data-split-lines`, `data-fade`, `data-reveal`, `data-words`, `data-parallax`,
`data-img-reveal`, `data-magnetic`, `data-count`) — add or remove an attribute to
change how an element behaves; no JavaScript edits required.

## Credits

Fonts: [Fraunces](https://github.com/undercasetype/Fraunces) and
[Inter](https://github.com/rsms/inter) (OFL). Motion:
[GSAP](https://gsap.com) + [Lenis](https://github.com/darkroomengineering/lenis).
Brass objects and logo hand-drawn as SVG for PittalCo.
