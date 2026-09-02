---
name: Global Heshmat
description: Interactive exhibition cartography of Egyptian sculptor Hassan Heshmat
colors:
  primary: '#1a8a7d'
  primary-text: '#177c71'
  primary-light: '#e8f5f2'
  accent: '#b8862d'
  accent-text: '#916a24'
  accent-light: 'rgba(184, 134, 45, 0.12)'
  search: '#c66b3d'
  search-text: '#a65a33'
  search-light: '#fdf0e8'
  moved: '#7c5cbf'
  moved-text: '#7b5bbd'
  moved-light: '#f3eefa'
  residence: '#40639c'
  header-bg: '#16192e'
  header-text: '#f0e6d3'
  surface: '#ffffff'
  surface-warm: '#faf6f0'
  surface-image: '#efe8dc'
  text-primary: '#2c2a26'
  text-secondary: '#5a564e'
  text-muted: '#757169'
  text-placeholder: '#706654'
  border: '#e8e3da'
  border-light: '#f0ebe3'
  black: '#000000'
typography:
  display:
    fontFamily: "'Cormorant Garamond Variable', Georgia, serif"
    fontSize: 'clamp(2rem, 4vw, 2.875rem)'
    fontWeight: 500
    lineHeight: 1.2
  headline:
    fontFamily: "'Cormorant Garamond Variable', Georgia, serif"
    fontSize: '2rem'
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "'Cormorant Garamond Variable', Georgia, serif"
    fontSize: '1.375rem'
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "'Outfit Variable', system-ui, -apple-system, sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Outfit Variable', system-ui, -apple-system, sans-serif"
    fontSize: '0.8125rem'
    fontWeight: 500
    lineHeight: 1.4
rounded:
  hairline: '1px'
  xs: '4px'
  sm: '6px'
  md: '10px'
  lg: '14px'
  pill: '100px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  xl: '32px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '#ffffff'
    rounded: '{rounded.pill}'
    padding: '7px 18px'
  card:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.md}'
---

# Design System: Global Heshmat

## Overview

**Creative North Star: "The Living Exhibition Folio"**

Global Heshmat balances cartographic utility with exhibition-grade editorial dignity. Designed for exploring the public sculptures, architectural ceramics, and international relocations of Hassan Heshmat (1920–2006), the visual language evokes museum catalogues, architectural folios, and Mediterranean terracotta.

The interface is structured around warm archival off-white (`#faf6f0`), deep ink-navy chrome (`#16192e`), and glazed ceramic accent tones (Egyptian turquoise, terracotta rust, desert gold, and relocation amethyst). The layout gives primary visual authority to the spatial cartography and high-resolution sculpture photography. Navigational chrome recedes into crisp, ambient boundaries.

**Key Characteristics:**

- Archival Warmth: Warm off-white surfaces and parchment tones replace sterile digital grays.
- Expressive Serifs: Cormorant Garamond provides editorial authority for titles and artwork names.
- Modern Legibility: Outfit provides neutral, highly legible UI and body copy.
- Tactile Exhibition Cards: Sculptures are presented with quiet elegance and smooth image focus.
- Strict Accessibility: All text and interactive pairings are pinned to WCAG AA (>= 4.5:1) standards.
- Deliberate Palette: Single warm exhibition light mode; no dark mode by deliberate editorial design.

## Colors

The palette is derived from Egyptian architectural materials, glazed ceramics, and museum catalogue printing.

- **Primary Teal** (`#1a8a7d` / text `#177c71`): Represents confirmed in-situ public works.
- **Accent Gold** (`#b8862d` / text `#916a24`): Primary call-to-action and decorative underlines.
- **Search Rust** (`#c66b3d` / text `#a65a33`): Identifies unlocated or searched-for sculptures.
- **Moved Purple** (`#7c5cbf` / text `#7b5bbd`): Distinguishes relocated works and migration paths.
- **Residence Blue** (`#40639c`): Marks historical ateliers and residences of the sculptor.
- **Surfaces**: Pure White (`#ffffff`), Warm Surface (`#faf6f0`), and Image Matting (`#efe8dc`).
- **Text Ink**: High-contrast navy ink (`#16192e`) and charcoal (`#2c2a26`).

## Typography

Typography establishes clear editorial hierarchy through two complementary typefaces:

- **Display & Headings**: `Cormorant Garamond Variable` (300, 400, 500, 600, 700). Used for page headings, artwork titles, and modal headers. The type scale ranges up to 46px (`--text-5xl`), giving the serif room to express its calligraphic qualities.
- **Interface & Body**: `Outfit Variable` (300, 400, 500, 600). Used for UI controls, filter chips, captions, addresses, and long-form descriptive copy.
- **Bilingual Typographic Care**: All Arabic script labels are rendered with `dir="auto"` and appropriate leading to prevent glyph clipping.

## Layout

- **Fixed Chrome Receding**: Header (68px), Filter Bar (48px/52px), and Footer (64px) frame the central canvas with light ambient borders, avoiding heavy visual weight.
- **Map Viewport**: Full-bleed spatial presentation where markers and vector tiles command attention.
- **Drawer Panels**: The Sidebar (460px desktop, full-width mobile) slides smoothly over the map without jarring layout shifts.
- **Grid Layout**: Responsive multi-column masonry/grid for `/collection` adapting from 1 column on phones to 4 columns on large displays.

## Elevation & Depth

- Ambient rather than dramatic shadows. Depth is communicated primarily through crisp 1px borders (`#e8e3da`) and subtle warm tints.
- `--shadow-sm`: Subtle button and chip resting state.
- `--shadow-md`: Floating controls (Legend, ViewSwitcher) and card hover.
- `--shadow-sidebar`: Directional soft drop-shadow separating details from the map.
- Lightbox and Modals use deep ink scrims (`rgba(22, 25, 46, 0.55)` and `0.94`) with backdrop blur (`4px` to `8px`).

## Shapes

- Rounded pill geometries (`var(--radius-pill)`) for interactive action chips, view switchers, and buttons.
- Medium corner radius (`10px`) for cards and floating overlay panels.
- Fine radius (`4px` to `6px`) for tags, badges, and thumbnail images.

## Components

- **Header**: Wordmark with italic gold emphasis, view switcher, and compact appeal action. On mobile, controls align to an exact 44px vertical bounding box.
- **Collection Cards**: Framed 4:3 figure with warm background matting, subtle scale zoom on hover, and distinct metadata layout.
- **Legend**: Floating, collapsible translucent box at bottom-left of the map with dashed relocation indicator.
- **Artwork Detail Sidebar**: Editorial article presentation with gold rule accent under title, gallery viewer, provenance badges, and expandable descriptions.

## Do's and Don'ts

- **Do** use `--color-*-text` variants whenever brand hues carry text or icon glyphs to guarantee WCAG AA contrast.
- **Do** preserve `dir="auto"` on any element rendering artwork names, addresses, or descriptions.
- **Do** honour `prefers-reduced-motion` for all transitions and map relocations.
- **Don't** add arbitrary saturated colors outside the defined 5 semantic hue families.
- **Don't** make the header or footer chrome visually heavier with dark dropped drop-shadows.
- **Don't** introduce dark mode; the warm gallery aesthetic is a deliberate project constant.
