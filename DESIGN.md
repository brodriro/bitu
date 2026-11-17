---
name: Bitu
description: A risograph maker zine for an open DIY robot research dossier.
colors:
  paper-yellow: "#ffd23f"
  paper-yellow-deep: "#f5c21c"
  paper-pink: "#ffc2dc"
  federal-blue: "#2c3fd6"
  federal-blue-deep: "#1d2a9e"
  fluoro-pink: "#ff4fa0"
  overprint-violet: "#6b2fb3"
  ink: "#17143a"
  ink-soft: "#3a3466"
  pale-yellow-on-blue: "#ffe68a"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Arial Narrow, sans-serif"
    fontSize: "clamp(7rem, 24vw, 19rem)"
    fontWeight: 800
    lineHeight: 0.78
    letterSpacing: "-0.035em"
    fontVariation: "\"wdth\" 75, \"opsz\" 96"
  headline:
    fontFamily: "Bricolage Grotesque, Arial Narrow, sans-serif"
    fontSize: "clamp(2.6rem, 6.4vw, 5.25rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.02em"
    fontVariation: "\"wdth\" 75, \"opsz\" 96"
  title:
    fontFamily: "Bricolage Grotesque, Arial Narrow, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.1
    fontVariation: "\"wdth\" 85"
  body:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.06em"
  data:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.3
    fontFeature: "\"tnum\""
rounded:
  tag: "3px"
  nav: "4px"
  sheet: "6px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 48px)"
  section: "clamp(64px, 9vw, 120px)"
  column-gap: "clamp(24px, 4vw, 56px)"
  measure: "68ch"
  container: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.federal-blue}"
    textColor: "{colors.paper-yellow}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0.95rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.overprint-violet}"
    textColor: "{colors.paper-yellow}"
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.federal-blue}"
    rounded: "{rounded.pill}"
    padding: "0.7rem 1.1rem"
  tab-selected:
    backgroundColor: "{colors.federal-blue}"
    textColor: "{colors.paper-yellow}"
  toggle-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-yellow}"
    rounded: "{rounded.pill}"
  tag:
    backgroundColor: "{colors.fluoro-pink}"
    textColor: "{colors.ink}"
    typography: "{typography.data}"
    rounded: "{rounded.tag}"
    padding: "0.3rem 0.45rem"
  nav:
    backgroundColor: "{colors.federal-blue}"
    textColor: "{colors.paper-yellow}"
    height: "56px"
  nav-link-active:
    backgroundColor: "{colors.fluoro-pink}"
    textColor: "{colors.ink}"
    rounded: "{rounded.nav}"
---

# Design System: Bitu

## Overview

**Creative North Star: "The Two-Ink Riso Zine"**

The system is a stapled research zine printed on yellow stock with two risograph inks: federal blue and fluoro pink. Every surface reads as a sheet (`hoja`) in a bound pamphlet; sections are separated by staples on a dashed fold, some sheets flip to full blue ink, and inserts drop onto pink paper. Pink is the second pass of ink, so it appears as a slight misregistration behind blue display type and as a solid under-print beneath selected controls.

Density is that of a dense technical dossier: tables, specs, and numbered lists set in a hyperlegible body face, with numbers in a monospace data voice. Display type is condensed, heavy, and tight, and it carries the personality; the body stays calm and readable. A fixed multiply grain over the whole page gives the paper its tooth.

**Key Characteristics:**
- Yellow paper ground, blue ink for structure and display, pink ink as the second pass.
- Condensed 800-weight Bricolage Grotesque with a pink offset shadow for headlines.
- Sheets, staples, tape, and full-bleed inverse blue sheets as the section grammar.
- Monospace tabular figures for every price, quantity, and estimate.

## Colors

Two inks over coloured paper; violet only exists where the two inks overprint.

### Primary
- **Federal Blue** (#2c3fd6): display type, primary buttons, the sticky contents bar, inverse `tinta` sheets, focus rings, links. **Federal Blue Deep** (#1d2a9e) is its reserved darker step.

### Secondary
- **Fluoro Pink** (#ff4fa0): the second ink pass. Misregistered text shadow under display type, under-print beneath buttons and selected tabs, counters, tags, nav hover/current state, selection, table row hover (12% tint), tape on the order sheet.

### Tertiary
- **Overprint Violet** (#6b2fb3): blue over pink. Link and button hover, estimate badges (`.est`).

### Neutral
- **Yellow Paper** (#ffd23f): page ground and text on blue. **Deep Yellow** (#f5c21c) for the scrollbar track.
- **Pink Paper** (#ffc2dc): insert sheets (`.hoja.rosa`).
- **Riso Ink** (#17143a): reading text, heavy rules, borders of the order sheet and alerts. Rules use it at 28% (`rgba(23,20,58,.28)`).
- **Soft Ink** (#3a3466): captions, table headers, secondary prose.
- **Pale Yellow on Blue** (#ffe68a): secondary text, table headers, and captions on blue sheets.

### Named Rules
**The Two Inks Rule.** Colour comes from blue and pink ink on yellow or pink paper. Violet is only their overprint; no other hue enters.

**The Second Pass Rule.** Pink sits behind or beneath blue, offset like a misregistered plate; it is ink, not a glow.

## Typography

**Display Font:** Bricolage Grotesque (with Arial Narrow), variable width axis at 75–85
**Body Font:** Atkinson Hyperlegible (with system-ui)
**Data Font:** JetBrains Mono (with ui-monospace)

**Character:** A loud, condensed poster grotesque over a body face built for legibility; the mono is the lab notebook voice for figures.

### Hierarchy
- **Display** (800, clamp(7rem, 24vw, 19rem), 0.78, -0.035em): the masthead only, with a pink duplicate layer offset (0.035em, 0.03em).
- **Headline** (800, clamp(2.6rem, 6.4vw, 5.25rem), 0.9, -0.02em): section titles (`.h-riso`), pink text shadow (0.045em 0.035em 0).
- **Title** (800, 1.5rem, 1.1, wdth 85): h3 inside sheets, in blue.
- **Figures** (800 display, 2.4–6rem, wdth 75): totals, prices, ranges, and list counters set large in display type with tabular numbers.
- **Body** (400, 1.0625rem, 1.6; 1rem under 560px): prose to a 68ch measure.
- **Label** (800, 0.76–0.82rem, 0.06em, uppercase): table headers, definition terms, nav links.
- **Data** (700, 0.75–0.8rem mono, tabular-nums): captions, folios, tags, prices in tables.

### Named Rules
**The Tabular Figures Rule.** Every number that can be compared (price, count, estimate, pin) is mono or display with `tabular-nums`.

## Layout

A single 1200px column (`min(1200px, 100% - 2 * gutter)`) with a fluid gutter of clamp(16px, 4vw, 48px). Sections pad clamp(64px, 9vw, 120px) top. Section heads are a two-column grid (title, then a 34ch dek) aligned to the baseline end. Content splits into asymmetric two-column grids (1.25fr/0.9fr, 1.1fr/1fr) with clamp(24px, 4vw, 56px) gaps, three-column numbered lists, and an 8-step pipeline grid. At 960px everything collapses to one column (pipeline to 4, then 2 at 560px). Wide tables scroll horizontally inside a container topped by a 3px ink rule.

## Elevation & Depth

Depth is paper, not light. Layers are distinguished by paper colour and ink flips (blue sheets, pink inserts), a fixed multiply grain (22% opacity), and physical props: staples, tape, a slightly rotated order sheet (-0.6deg). Soft shadows are rare and diffuse, used only where something sits on the page.

### Shadow Vocabulary
- **Sheet lift** (`box-shadow: 0 14px 30px -18px rgba(23,20,58,.55)`): the order sheet resting on the page.
- **Bar shadow** (`box-shadow: 0 6px 18px -10px rgba(23,20,58,.6)`): sticky contents bar.
- **Ink under-print** (`box-shadow: 0 3px 0 #ff4fa0`): pink second pass under the primary button and selected tab; grows to 5px on hover and 1px on press.
- **Misregistration** (`text-shadow: .045em .035em 0 #ff4fa0`): display type only.

## Shapes

Two families: soft sheet corners (3–6px) for paper objects, tags, and alerts, and full pills (999px) for anything pressable. Borders are ink strokes of 1.5–3px; dashed strokes mark folds, estimates, and phase dividers. Small square pink marks (10px) act as the brand pip.

## Components

### Buttons
- **Shape:** full pill (999px).
- **Primary:** blue fill, yellow text, Atkinson 800 1rem, padding 0.95rem 1.25rem, pink 3px under-print.
- **Hover / Active:** violet fill, lifts 2px with a 5px under-print; press drops 1px. Transitions 0.25s `cubic-bezier(.16,1,.3,1)`.

### Tabs and toggles
- **Tabs:** outlined pills (2.5px blue), blue text with a large display letter; selected fills blue with pink under-print.
- **Toggle:** ink-outlined pill track with 3px inset; pressed segment fills ink with yellow text; disabled at 45% opacity.

### Chips / Tags
- **Tag:** pink fill, ink mono text, 3px corners (`.nuevo`, `.puerta`, `.reco`).
- **Estimate badge:** violet mono text in a 1.5px dashed border.
- **Version pill:** 1.5px yellow outline on blue; current version fills yellow.

### Cards / Containers
- **Order sheet:** paper mixed 55% with white, 2px ink border, 6px corners, tape strip, sheet lift, -0.6deg tilt (flat on mobile).
- **Alert:** 2.5px ink border, 6px corners, 44px pink icon column.

### Navigation
- Sticky blue contents bar, 56px tall; wordmark in condensed display with a pink pip; uppercase 0.82rem links that scroll horizontally with a fade mask. Hover and current fill pink with ink text.

### Sheet divider (signature)
- A 2px dashed fold carrying two drawn staples at 22% from each edge.

## Do's and Don'ts

### Do:
- **Do** set display type in Bricolage Grotesque 800 at wdth 75 with the pink misregistration offset.
- **Do** separate sections as sheets: staples, blue `tinta` sheets, pink inserts.
- **Do** put the pink ink under pressed or selected controls as a solid 3px under-print.
- **Do** set every comparable number in JetBrains Mono or display type with tabular figures.
- **Do** honour `prefers-reduced-motion`: the reprint, blink, and float animations switch off.

### Don't:
- **Don't** introduce a hue beyond the two inks, their overprint violet, and the paper stocks.
- **Don't** use blurred glows or coloured soft shadows; depth is paper and offset ink.
- **Don't** set long reading text in the display face or the mono.
