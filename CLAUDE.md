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
  - Sources sold in packs carry `"unidades": N` (automatic or manual) so prices are per unit; links that are not the exact part to buy carry `"referencia": true`. Before any purchase, `docs/research/07-precios-exactos.md` «Antes de pagar» lists the variant traps (N16R8, TTP223 size, M2,5 × 40 screws, etc.); keep it, the catalog and the web checklist in sync.
  - The "Bitu en 3D" section is `web/modelo3d.js` (ES module; Three.js 0.160 via the importmap in `index.html`, no build). Parts are procedural primitives in millimetres; part dimensions, layout inside the head and the 9-step assembly sequence are specified in `docs/research/08-modelo-3d.md` — keep both in sync. Deep links: `#3d-paso-N` (assembly step) and `#3d-pieza-<id>` (part viewer, ids match `tools/precios/catalogo.json`).
  - The Cableado, Firmware, Servidor and Puesta en marcha sections mirror `docs/research/10-guia-tecnica.md` (wiring by bus, custom `bitu-a` board, server deploy, bring-up checklist). The site's reader is the programmer/assembler, not the customer: keep copy technical.
  - Most content is hand-written HTML in `index.html`; the interactive assembly selector (proposals A/B, BOM, pin tables, steps) renders from the `PROPUESTAS` object in `web/app.js`. When `docs/research/05-propuestas-de-ensamble.md` changes, update that object too.
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/` — design context for the `/impeccable` skill (product truth, visual system "risograph maker zine", direction contract in `.impeccable/surfaces/`).

## Current decisions

- Project name: **Bitu** (trademark search pending). Recommended pilot build: **Proposal A** (ESP32-S3 thin client running xiaozhi-esp32 firmware + self-hosted `xiaozhi-esp32-server`, **DeepSeek API** (`deepseek-flash`, non-thinking) as the default LLM since 2026-11-17; server template in `tools/servidor/config-deepseek.yaml`, details and risks in `docs/research/03-arquitectura-software.md` §5.3). Active roadmap: `docs/plan/plan-de-mejora.md` v4.
- Scope (since 2026-11-17): only **A (básico)** and **B (expresivo)**. A′ (ESP32-S3-BOX-3) is parked and C (Raspberry Pi 5) is **discarded for the MVP** (too expensive; local LLM = Ollama on a classroom PC). Both are kept in the research docs, removed from the parts catalog (archived in `tools/precios/catalogo-archivo.json`), the assembly selector and the 3D part gallery.
- Chosen case for A: **Delta suave** (triangular prism, 11.8 cm side, display at the centroid; spec in `docs/research/09-carcasas.md`). A's face is the **Waveshare 1.85" round touch LCD (ST77916, QSPI, Ø 5.5 cm)**, which needs a custom xiaozhi board config (pins in doc 05, untested). User-facing measurements (docs and web) are written in **centimetres**; the CAD script works in mm internally. The 3D assembly simulation loads the Delta suave meshes from `web/modelos/carcasa-delta-suave.glb` (so rerun `carcasas.py` after CAD changes); B needs its own Delta variant.

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

Regenerate the preliminary case designs (build123d, isolated venv; writes STL/STEP to `cad/carcasas/`, GLB + `carcasas.json` to `web/modelos/` for the viewer's "Diseños de carcasa" mode):

```bash
uv venv --python 3.12 tools/carcasas/.venv && uv pip install --python tools/carcasas/.venv/bin/python build123d==0.13.0   # once
tools/carcasas/.venv/bin/python tools/carcasas/carcasas.py
```

`carcasas.py` models the electronics as keep-out volumes from the verified dimensions in `docs/research/08-modelo-3d.md` and fails a design (`todo_cabe: false`) if any part collides with or sticks out of the case; designs and results are documented in `docs/research/09-carcasas.md`. Older build123d pins (0.9/0.10) break on OCP/ocpsvg version mismatches. Deep link: `#3d-carcasa-<cubo|capsula|lampara|delta|delta-suave>`.

## Conventions

- Docs and website copy are written in **Spanish**.
- Prices are quoted in USD with a source and the date checked; mark estimates as estimates.
- Keep the site dependency-free; external assets only if they are pinned and can be inlined later.
