# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pilot project for a **physical desktop mini AI assistant robot** (small companion bot with a screen "face", mic, speaker and optional motion) that answers questions either through a **cloud LLM API** or a **local model**. Target audience: teens and young people (ages ~12–19), so content, tone and safety choices must fit that group.

The repository currently holds research and a static website — no firmware or robot software yet.

## Layout and source of truth

- `docs/` is the **source of truth**. Every fact shown on the website (components, prices, cases, assembly options, roadmap, name) must come from a Markdown file here. Update `docs/` first, then reflect the change in `web/`.
  - `docs/research/` — hardware research, bill of materials with prices, case options, assembly proposals, software/LLM architecture.
  - `docs/plan/` — improvement plan and its iterations.
  - `docs/iterations/` — log of website polish passes.
- `web/` — static site (plain HTML/CSS/JS, no build step, no framework). `web/index.html` is the entry point.
  - The parts catalog section renders from `web/catalogo-datos.js`, which `tools/precios/scrape_precios.py` generates (never edit it by hand; edit `tools/precios/catalogo.json` and rerun). Manual prices (from web search, for shops that block automated reads) go in `catalogo.json` as `"manual"` sources.
  - The "Bitu en 3D" section is `web/modelo3d.js` (ES module; Three.js 0.160 via the importmap in `index.html`, no build). Parts are procedural primitives in millimetres; part dimensions, layout inside the head and the 9-step assembly sequence are specified in `docs/research/08-modelo-3d.md` — keep both in sync. Deep links: `#3d-paso-N` (assembly step) and `#3d-pieza-<id>` (part viewer, ids match `tools/precios/catalogo.json`).
  - Most content is hand-written HTML in `index.html`; the interactive assembly selector (proposals A/B/C, BOM, pin tables, steps) renders from the `PROPUESTAS` object in `web/app.js`. When `docs/research/05-propuestas-de-ensamble.md` changes, update that object too.
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/` — design context for the `/impeccable` skill (product truth, visual system "risograph maker zine", direction contract in `.impeccable/surfaces/`).

## Current decisions

- Project name: **Bitu** (trademark search pending). Recommended pilot build: **Proposal A** (ESP32-S3 thin client running xiaozhi-esp32 firmware + self-hosted `xiaozhi-esp32-server`, Claude Haiku 5.5 by default). Active roadmap: `docs/plan/plan-de-mejora.md` v4.

## Commands

Preview the website locally (no build needed):

```bash
python3 -m http.server 8000 -d web
# open http://localhost:8000
```

Refresh component prices (stdlib only; writes `docs/research/precios/ultimo.json` and a dated report):

```bash
python3 tools/precios/scrape_precios.py            # all sources in tools/precios/catalogo.json
python3 tools/precios/scrape_precios.py --solo adafruit
```

The scraper must keep obeying robots.txt and treat 403/429/captcha as "bloqueado" — never add evasion (browser automation, cookie/UA spoofing). For shops that block it, use official APIs (Mouser/DigiKey) or record prices manually in `docs/research/07-precios-exactos.md`.

## Conventions

- Docs and website copy are written in **Spanish**.
- Prices are quoted in USD with a source and the date checked; mark estimates as estimates.
- Keep the site dependency-free; external assets only if they are pinned and can be inlined later.
