/**
 * ============================================================
 *  PLACE OF RESIDENCE — DATA FILE TEMPLATE
 * ============================================================
 *
 *  A "Place of residence" is a city or building where Hassan Heshmat
 *  *lived or worked* (his hometown on the Nile, Cairo, Selb, …) — as
 *  distinct from where his artworks stand. These belong to the
 *  "Places of residence" category shown in the map legend and filter.
 *
 *  ── HOW TO ADD ONE ─────────────────────────────────────────
 *  1. Copy this file and rename it:  NNN-short-name.ts
 *     (e.g. 002-selb.ts). Use the next free id/number.
 *  2. Fill in the fields below.
 *  3. (Optional) Drop a photo into  originals/  and regenerate the
 *     WebP derivatives — same process as artworks (see the repo README).
 *  4. Save. Every .ts file in this folder (except _template and index)
 *     is auto-collected via Vite's import.meta.glob — no registration.
 *
 *  ── NOTE ───────────────────────────────────────────────────
 *  Residence markers are NOT drawn on the map yet — the category is a
 *  legend/filter placeholder for now. Files added here are stored and
 *  ready; plotting is switched on later in MapView.svelte once enough
 *  residences have been collected.
 *
 *  ── FIELD REFERENCE ────────────────────────────────────────
 *  id        Unique number (check the highest existing id, then +1).
 *  name      Place or building name (e.g. "School of Applied Arts").
 *  lat, lng  Coordinates in decimal degrees. In Google Maps, right-click
 *            the spot and click the coordinates to copy them.
 *  country   Country name.
 *  city      City or locality.
 *  years     Period of residence, e.g. "1957–1959" or "from 1948".
 *  desc      Short note — what the place was, or what he did there.
 *            HTML is allowed (<em>, <a href="">, …).
 *  image         (optional) photo filename placed in originals/.
 *  imageCaption  (optional) credit line for that photo.
 *
 * ============================================================
 *  FILLED EXAMPLE (copy and adapt)
 * ============================================================
 */

import type { Residence } from '../types';

const residence: Residence = {
	id: 4,
	name: 'Ezbet El Nakhl',
	lat: 30.138763547445613,
	lng: 31.32135369007047,
	country: 'Egypt',
	city: 'Cairo (Ezbet El Nakhl)',
	years: '1945',
	desc: 'Hassan Heshmat lived here as a young man',
	images: [{src: "Heshmat 1942 Ezbet al Nakhl.jpg",
	         caption: "Around 1942: Hassan Heshmat with clay plates and mugs. An order most probably commissioned by the British army. The photo was taken in Ezbet al Nakhl, Cairo, where Heshmat lived at the time."
	}
],
};

export default residence;
