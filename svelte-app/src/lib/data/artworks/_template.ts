/**
 * ============================================================
 *  ARTWORK DATA FILE — TEMPLATE WITH EXAMPLE
 * ============================================================
 *
 *  This is a filled-in example showing all available fields.
 *  For each new artwork, create a copy of this file, rename it
 *  following the pattern:  NNN-short-name.ts
 *  (e.g. 031-sphinx-avenue.ts) and place it in this same folder.
 *
 *  The app auto-imports every .ts file in this folder
 *  (except _template) — no extra registration step is needed.
 *
 * ============================================================
 *  FIELD REFERENCE
 * ============================================================
 *
 *  REQUIRED FIELDS  (every artwork must have these)
 *  ─────────────────────────────────────────────────
 *  id            Unique number. Check the highest existing id and increment by 1.
 *  name          Artwork or site name.
 *  lat           Latitude  (decimal degrees, e.g. 30.038).
 *  lng           Longitude (decimal degrees, e.g. 31.213).
 *  country       Country name — used for filter chips in the UI.
 *  city          City or locality — displayed in the sidebar.
 *  status        Either "located" (confirmed location) or "search" (to be found).
 *  address       Street address or Google Plus Code.
 *  desc          Description text. HTML tags are allowed (e.g. <em>, <a href="">).
 *
 *  OPTIONAL FIELDS  (include only when applicable)
 *  ─────────────────────────────────────────────────
 *  slug          URL slug override. If omitted, a slug is auto-derived from
 *                `name` (e.g. "Sphinx Avenue Relief" → "sphinx-avenue-relief").
 *                Set this only if you need to keep a stable URL after renaming
 *                the artwork, or to disambiguate two works that share a name.
 *                The site URL becomes:  /artworks/<slug>/
 *
 *  image         Filename of a single image stored in  originals/
 *                Example: "my-photo.jpg"
 *                >>> The actual image file must be placed in the originals/ folder.
 *
 *  imageCaption  Credit / caption for the single image above.
 *                Example: "Photo: John Doe, 2024"
 *
 *  images        Array of multiple images (use this instead of image/imageCaption
 *                when there are several photos). Each entry has:
 *                  - src:      filename in originals/       (REQUIRED)
 *                  - caption:  description or credit          (optional)
 *                >>> Each image file listed in src must exist in the originalss/ folder.
 *                >>> Use descriptive file names (e.g. "024-mermaid-front-view.jpg"),
 *                    NOT generic names like "photo1.jpg".
 *
 *  links         Array of external reference links. Each entry has:
 *                  - label:  display text for the link       (REQUIRED)
 *                  - url:    full URL                        (REQUIRED)
 *
 *  video         A YouTube URL (the app extracts the embed automatically).
 *                Example: "https://www.youtube.com/watch?v=XXXXXXXXXXX"
 *
 *  videoFile     Filename of a self-hosted clip in  static/videos/  — played
 *                inline with a native <video> player. Use this instead of
 *                `video` for a local file. Example: "my-clip.mp4"
 *                >>> Place the actual .mp4 (H.264/AAC) in static/videos/.
 *
 *  videoCaption  Credit / caption shown beneath the local video.
 *
 *  movement      For artworks that were relocated. Contains:
 *                  - fromLat:   original latitude            (REQUIRED)
 *                  - fromLng:   original longitude           (REQUIRED)
 *                  - fromName:  original location name       (REQUIRED)
 *                  - year:      year of relocation           (REQUIRED)
 *
 * ============================================================
 *  IMPORTANT NOTES
 * ============================================================
 *
 *  1. IMAGE FILES
 *     - All image files must be placed in:  originals/
 *     - Use the EXACT filename (case-sensitive) in the "image" or "src" fields.
 *     - Accepted formats: .jpg, .jpeg, .png, .webp
 *     - Please provide the file name of each image in the data file,
 *       AND send the actual image files separately so they can be added
 *       to the originals/ folder.
 *
 *  2. COORDINATES
 *     - Use decimal degrees (not DMS).
 *     - You can get coordinates from Google Maps: right-click a location
 *       and click on the coordinates to copy them.
 *
 *  3. STATUS
 *     - "located"  = the artwork's current location is confirmed.
 *     - "search"   = the artwork is known to exist but its location
 *                    has not been confirmed yet.
 *
 *  4. DESCRIPTION
 *     - Can include HTML for formatting: <em>italic</em>, <strong>bold</strong>,
 *       <a href="https://...">links</a>.
 *     - Keep it concise but informative — a short paragraph is ideal.
 *
 *  5. MOVEMENT
 *     - Only use if the artwork was physically moved from one location to another.
 *     - The current lat/lng should reflect where the artwork is NOW.
 *     - The movement.fromLat/fromLng should reflect the ORIGINAL location.
 *
 * ============================================================
 *  PLACES OF RESIDENCE  (separate template)
 * ============================================================
 *
 *  Where Heshmat *lived or worked* (hometown, Cairo, Selb, …) is a separate
 *  map category with its OWN data type, template and folder — do NOT add a
 *  residence as an artwork file here. See:
 *      src/lib/data/residences/_template.ts
 *
 * ============================================================
 *  FILLED EXAMPLE (copy and adapt)
 * ============================================================
 */

import type { Artwork } from '../types';

const artwork: Artwork = {
	// ── Required fields ──────────────────────────────────
	id: 999, // REPLACE with the next free id — the build fails on a duplicate
	name: 'Sphinx Avenue Relief',
	lat: 30.045,
	lng: 31.235,
	country: 'Egypt',
	city: 'Cairo (Downtown)',
	status: 'located',
	address: '123 Tahrir Square, Downtown Cairo, Cairo Governorate',
	desc: 'A large bronze relief commissioned in 1975 for the entrance hall of the National Bank. The work depicts a procession of sphinxes and was unveiled by President Sadat. See also the <a href="https://example.com">museum catalogue</a>.',

	// ── Single image (use this OR images[], not both) ────
	image: '031-sphinx-avenue.jpg', // place this file in originals/
	imageCaption: 'Photo: Sonja Hegasy, 2019',

	// ── Multiple images (use this OR image, not both) ────
	// images: [
	// 	{
	// 		src: "031-sphinx-avenue-front.jpg",
	// 		caption: "Front view of the relief"
	// 	},
	// 	{
	// 		src: "031-sphinx-avenue-detail.jpg",
	// 		caption: "Detail of the sphinx procession"
	// 	}
	// ],

	// ── External links ───────────────────────────────────
	links: [
		{
			label: 'Museum catalogue entry',
			url: 'https://example.com/catalogue/sphinx-avenue'
		},
		{
			label: 'Wikimedia Commons',
			url: 'https://commons.wikimedia.org/wiki/File:Sphinx_Avenue.jpg'
		}
	],

	// ── YouTube video ────────────────────────────────────
	// video: "https://www.youtube.com/watch?v=XXXXXXXXXXX",

	// ── Self-hosted video (file in static/videos/) ───────
	// videoFile: "my-clip.mp4",
	// videoCaption: "Video: Jane Doe, 2026",

	// ── Relocation info (only if the artwork was moved) ──
	movement: {
		fromLat: 30.05,
		fromLng: 31.24,
		fromName: 'Original location, Heliopolis',
		year: 2010
	}
};

export default artwork;
