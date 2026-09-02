# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Art historians, curators, and modern art researchers studying 20th-century Arab and Egyptian modernism, public monuments, and transnational sculpture.
- Researchers at the Leibniz-Zentrum Moderner Orient (ZMO) in Berlin and international academic partners.
- The family, collaborators, and estate of Egyptian sculptor Hassan Heshmat (1920–2006).
- The cultural public, museum visitors, and travelers encountering Heshmat's public sculptures in Egypt, Germany, and beyond.

## Product Purpose

Global Heshmat is a scholarly digital-humanities exhibition cartography tracing the public artworks, architectural reliefs, and ceramics of the pioneering Egyptian sculptor Hassan Heshmat across the world. Success means providing an authoritative, accessible, and visually evocative spatial archive that allows visitors to discover sculptures in their urban contexts, track pieces that have relocated over time, and participate in locating unconfirmed works.

## Positioning

Unlike static catalog raisonnés or generic museum inventory tables, Global Heshmat merges interactive cartography with exhibition-grade editorial design. It treats spatial presence, urban context, and geographic displacement as central art-historical dimensions of 20th-century sculpture.

## Operating Context

- Used in academic research and lecture halls on desktop viewports, as well as on mobile devices in the field while visiting sculpture sites in Cairo, Alexandria, Selb, and elsewhere.
- Functions as an installable Progressive Web App (PWA) hosted statically on GitHub Pages (heshmat.zmo.de).
- Key surfaces: Interactive Map View (/), Browsable Collection Grid (/collection), Artwork Detail Sidebar (/artworks/[slug]), and contextual modals.

## Capabilities and Constraints

- SvelteKit with Svelte 5 runes, prerendered to static HTML via @sveltejs/adapter-static.
- MapLibre GL JS with CartoDB Voyager tiles, lazy-loaded for fast initial paint and offline resilience.
- Strict WCAG AA contrast floor verified automatically by test suites (contrast.test.ts).
- Native support for bilingual Arabic-European labels with dir=auto.
- High-resolution local WebP derivatives (thumb, web, full) generated from archived photography.

## Brand Commitments

- Visual Identity: Exhibition Cartography — warm archival paper surface (#faf6f0), rich ink navy chrome (#16192e), and accent hues inspired by ceramic glazes (terracotta rust, lapis teal, desert gold, royal moved purple).
- Typography: Cormorant Garamond for display editorial headings; Outfit for clean, legible UI and body copy.
- Voice: Dignified, culturally grounded, archival, clear, and inviting.

## Evidence on Hand

- Verified database of artworks and historical residences in src/lib/data/.
- Archival photographic documentation and historical correspondence.
- Precise geocoding and historical relocation trajectories.

## Product Principles

1. **Artifact Leads, Interface Recedes**: Public sculpture and archival photography take center stage; UI chrome provides quiet, reliable navigation.
2. **Archival Rigor**: Provenance, locations, relocation histories, and dates are preserved with historical precision.
3. **Inclusivity and Dual-Script Ergonomics**: Arabic and Latin typography, high contrast, and accessible touch targets are built in from the ground up.
4. **Durable Simplicity**: Fast static delivery, low overhead, and no dependencies on fragile server infrastructure.

## Accessibility & Inclusion

- Built to meet WCAG 2.2 AA standards across all views.
- prefers-reduced-motion respected for all transitions and map interactions.
- Full keyboard operability and focus containment in modals and sidebars.
