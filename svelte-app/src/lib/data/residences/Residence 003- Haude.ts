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
 *  3. (Optional) Drop a photo into  static/images/  and regenerate the
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
 *  image         (optional) photo filename placed in static/images/.
 *  imageCaption  (optional) credit line for that photo.
 *
 * ============================================================
 *  FILLED EXAMPLE (copy and adapt)
 * ============================================================
 */

import type { Residence } from '../types';

const residence: Residence = {
	id: 3,
	name: 'Haus der Familie Haude',
	lat: 50.15855575931875,
	lng: 12.14599910244687,
	country: 'Germany',
	city: 'Selb',
	years: '1977',
	desc: 'Whilst studying at the Porcelain Technical College in Selb, Hassan Heshmat lived with the Haude family at 6 Ahornweg, 95100 Selb, Germany.',
    image: 'Selb_Haus_II.jpeg',
	imageCaption: 'Hassan Heshmats Accodmodation in Selb, Bavaria, 2026'
	
};

export default residence;

