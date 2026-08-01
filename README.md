# Global Heshmat

**Following the Egyptian Sculptor Hassan Heshmat around the world** — an interactive map of artworks in public spaces.

Live site: [heshmat.zmo.de](https://heshmat.zmo.de).
Hosting: GitHub Pages from this repository, deployed automatically on every push to `main`.

Built with [SvelteKit](https://svelte.dev/), [MapLibre GL JS](https://maplibre.org/), and TypeScript.

## About

Global Heshmat is a cartographic web application that traces the public artworks of the Egyptian sculptor Hassan Heshmat (1920–2006) across the globe.

A project by the [Leibniz-Zentrum Moderner Orient (ZMO)](http://www.zmo.de), Berlin.

## Tech stack

- **Framework:** [SvelteKit](https://svelte.dev/) (Svelte 5 with runes), prerendered to static HTML via `@sveltejs/adapter-static`
- **Map:** [MapLibre GL JS](https://maplibre.org/) with CartoDB Voyager vector tiles, lazy-loaded so the rest of the app stays SSR-safe
- **Language:** TypeScript
- **Build:** Vite
- **Hosting:** GitHub Pages (custom domain `heshmat.zmo.de`)
- **Lint/Format:** ESLint + Prettier (with Svelte plugins)

## Project structure

```
Global-Heshmat/
├── .github/
│   ├── workflows/
│   │   └── ci.yml                   # Lint, type-check, test, build matrix, Pages deploy
│   └── dependabot.yml
└── svelte-app/
    ├── src/
    │   ├── lib/
    │   │   ├── components/          # Svelte components
    │   │   │   ├── MapView.svelte         # MapLibre map, markers, clusters, relocation lines
    │   │   │   ├── Sidebar.svelte         # Artwork detail panel
    │   │   │   ├── Gallery.svelte         # Image carousel with thumbnails
    │   │   │   ├── Lightbox.svelte        # Full-screen image viewer
    │   │   │   ├── FilterBar.svelte       # Country/status filters + search
    │   │   │   ├── CollectionPanel.svelte # Browsable text index of the collection
    │   │   │   ├── ViewSwitcher.svelte    # Map / Grid / List switch
    │   │   │   ├── MarkerGlyph.svelte     # SVG twin of the map's marker shapes
    │   │   │   ├── Header.svelte          # Top navigation bar
    │   │   │   ├── Legend.svelte          # Map legend (collapsible)
    │   │   │   ├── Footer.svelte          # Brand mark + project credits
    │   │   │   ├── Modal.svelte           # Shared modal chrome (backdrop, focus trap)
    │   │   │   ├── AboutModal.svelte      # Project info & credits overlay
    │   │   │   ├── MissingWorksModal.svelte # Appeal for help locating works
    │   │   │   ├── VideoPlayer.svelte     # Self-hosted clip player
    │   │   │   └── Seo.svelte             # Per-page meta tags & JSON-LD
    │   │   ├── data/
    │   │   │   ├── types.ts               # TypeScript interfaces
    │   │   │   ├── artworks.ts            # Aggregated export + slug index
    │   │   │   ├── residences.ts          # Same, for places of residence
    │   │   │   ├── about.ts               # About / Missing-works modal content
    │   │   │   ├── artworks/              # One file per artwork (auto-loaded)
    │   │   │   │   ├── _template.ts       # Copy this to add a new artwork
    │   │   │   │   └── index.ts           # Auto-imports via import.meta.glob
    │   │   │   └── residences/            # One file per place of residence
    │   │   ├── stores/
    │   │   │   ├── map.svelte.ts          # Shared reactive state (Svelte 5 runes)
    │   │   │   └── url-sync.svelte.ts     # Bidirectional URL <-> state sync
    │   │   ├── utils/
    │   │   │   ├── build-index.ts         # Slug derivation + collision checks
    │   │   │   ├── map-filter.ts          # Filter predicates and country facets
    │   │   │   ├── geojson.ts             # Pure GeoJSON builders for the map layers
    │   │   │   ├── marker-icons.ts        # Marker shape specs + canvas icon drawing
    │   │   │   ├── slug.ts                # URL slug helper
    │   │   │   ├── image.ts               # Image filenames -> WebP derivatives + srcset
    │   │   │   ├── video.ts               # Local video URLs + YouTube id parsing
    │   │   │   ├── contrast.ts            # WCAG contrast maths (used by the tests)
    │   │   │   ├── focus-trap.ts          # Modal focus-trap action
    │   │   │   ├── hide-on-error.ts       # Hide an <img> whose source 404s
    │   │   │   └── xml.ts                 # XML entity escaping for the sitemap
    │   │   └── config.ts                  # SITE_URL, site metadata, URL helpers
    │   ├── routes/
    │   │   ├── +layout.svelte             # Page chrome (Header, FilterBar, MapView, Sidebar, …)
    │   │   ├── +layout.ts                 # prerender, ssr, trailingSlash settings
    │   │   ├── +page.svelte               # Home — SEO + back-compat ?artwork= redirect
    │   │   ├── +error.svelte              # 404 / error screen
    │   │   ├── collection/+page.svelte    # Photo grid of the whole collection
    │   │   ├── artworks/[slug]/
    │   │   │   ├── +page.ts               # entries() for prerender, load() for artwork
    │   │   │   └── +page.svelte           # Per-artwork SEO + store sync
    │   │   ├── residences/[slug]/         # Same, for places of residence
    │   │   └── sitemap.xml/+server.ts     # Prerendered sitemap.xml
    │   ├── app.css                        # Global reset, focus ring, shared primitives
    │   ├── tokens.css                     # Design tokens (colour, type, spacing, z-index)
    │   ├── app.html                       # Includes Google Search Console verification
    │   └── app.d.ts
    ├── originals/                         # Archived artwork photos (NOT deployed)
    ├── static/
    │   ├── CNAME                          # heshmat.zmo.de — picked up by GitHub Pages
    │   ├── robots.txt                     # Points crawlers at /sitemap.xml
    │   ├── videos/                        # Self-hosted clips, served as-is
    │   └── images/
    │       ├── thumb/                     # Generated <=400px WebP (thumbnail strips)
    │       ├── web/                       # Generated <=1200px WebP (sidebar gallery)
    │       └── full/                      # Generated <=2000px WebP (lightbox, hi-DPI)
    ├── scripts/
    │   ├── generate_image_derivatives.mjs # Build thumb/ + web/ + full/ from originals
    │   └── verify-build.mjs               # Post-build SEO / sitemap / image checks
    ├── package.json
    ├── svelte.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

## Routes & URLs

| URL                   | What it serves                                                                     |
| --------------------- | ---------------------------------------------------------------------------------- |
| `/`                   | Map view with no artwork preselected                                               |
| `/artworks/<slug>/`   | Same map, sidebar pre-opened on the artwork; one prerendered HTML file per artwork |
| `/collection/`        | Photo grid of every artwork and place of residence, honouring the active filter    |
| `/residences/<slug>/` | Same, for the places where Heshmat lived or worked                                 |
| `/sitemap.xml`        | Auto-generated sitemap listing the home page and every artwork and residence URL   |
| `/robots.txt`         | Allows all crawlers; points to the sitemap                                         |
| anything else         | `404.html` fallback, which renders `+error.svelte`                                 |

Each `/artworks/<slug>/` page is fully prerendered to static HTML at build time with its own `<title>`, `<meta>` description, Open Graph tags, Twitter Card, and JSON-LD `VisualArtwork` schema — so search engines and link-unfurlers (Slack, Twitter, etc.) see real per-artwork metadata, not a generic homepage.

Legacy `/?artwork=<id>` links are auto-redirected to the new canonical URLs on the client.

## Features

- **Interactive WebGL map** — MapLibre GL JS with CartoDB Voyager basemap
- **Marker clustering** — groups nearby markers, click to zoom in
- **Three marker types** — located (teal), to-be-found (orange), ghost markers for relocated artworks (dashed outline)
- **Relocation visualisation** — dashed lines connecting original and current locations
- **Places of residence** — a separate, unclustered marker layer for where Heshmat lived and worked
- **Country & status filters** — chips auto-generated from the data, sorted alphabetically with per-country counts
- **Three ways to read the collection** — the map, a photo grid at `/collection/`, and a side list, switchable from any of them. The grid matters because 26 of the 39 works are in Egypt and most of those in Cairo districts, so at world zoom the map shows the collection as a single dot
- **Browsable collection index** — a grouped, filter-aware text list of every entry, opened from the header or the skip link. It is also the site's internal link graph: every prerendered page carries real links to all 43 entries
- **Shape-coded markers** — located (disc), to be found (ring), place of residence (diamond) and former location (dashed ring). Shape rather than hue carries the distinction: under tritanopia the located and residence colours measure ΔE 12.4, indistinguishable at marker size. `MARKER_SPECS` is the single source, so the map canvas, the legend and the list cannot drift apart
- **Real-time search** — searches across names, cities, countries, and addresses
- **Sidebar detail view** — images, description, status tags, address, external links
- **Multi-image gallery** — thumbnail strip, prev/next navigation, image counter
- **Full-screen lightbox** — keyboard navigation (arrow keys, Escape)
- **YouTube video embeds** — inline in the sidebar
- **Per-artwork URLs** — each artwork has its own prerendered `/artworks/<slug>/` page for deep-linking, sharing, and indexing
- **SEO & structured data** — per-page `<title>`, canonical URL, Open Graph, Twitter Card, and JSON-LD (Schema.org `VisualArtwork` / `WebSite`)
- **Auto-generated sitemap** — `sitemap.xml` enumerates every artwork URL at build time
- **Responsive design** — works on mobile and desktop
- **Installable PWA** — app shell precached for offline use, images cached on demand; updates apply silently, with no install or reload prompts
- **Responsive images** — three WebP sizes served via `srcset`, so a phone never downloads the 2000px master
- **Accessibility** — skip link, `<main>` landmark, focus moved into panels as they open and restored on close, `aria-pressed` on filter chips, and a palette locked to WCAG AA contrast by unit test
- **Keyboard navigation** — Escape to close panels, arrow keys in lightbox

## Development

```bash
cd svelte-app
npm install
npx playwright install chromium
npm run dev
```

Use Node.js 22.13+ or Node.js 24. Node 20 is end-of-life and is no longer supported.

## Scripts

| Command                   | Description                                                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`             | Start dev server                                                                                                                             |
| `npm run build`           | Production build (writes `svelte-app/build/`)                                                                                                |
| `npm run preview`         | Preview production build                                                                                                                     |
| `npm run check`           | Type-check with svelte-check                                                                                                                 |
| `npm run lint`            | Prettier check + ESLint                                                                                                                      |
| `npm run format`          | Format with Prettier                                                                                                                         |
| `npm run images`          | Regenerate the WebP derivatives in `static/images/` from `originals/`                                                                        |
| `npm test`                | Run Vitest unit tests once                                                                                                                   |
| `npm run test:watch`      | Run Vitest in watch mode                                                                                                                     |
| `npm run test:e2e`        | Run Playwright browser and axe accessibility tests against the production build                                                              |
| `npm run test:lighthouse` | Check collection-route Lighthouse scores and JavaScript/map-loading budgets                                                                  |
| `npm run audit:prod`      | Fail on high-severity advisories in production dependencies                                                                                  |
| `npm run verify:build`    | Assert the `build/` artifact has the expected SEO + sitemap content, and that every referenced artwork image has a generated WebP derivative |
| `npm run validate`        | Run lint, typecheck, unit tests, build assertions, Playwright/axe, and Lighthouse budgets                                                    |

## Testing

Four layers, all run in CI:

- **Vitest unit tests** live next to the source as `*.test.ts`. They cover the pure layer — `slugify`, `escapeXml`, the `artworkPath` / `absoluteUrl` helpers, the slug-collision checks in `buildIndex`, the map filter predicates and GeoJSON builders, the image-URL and `srcset` helpers, and YouTube id parsing. `contrast.test.ts` additionally reads the colour values straight out of `tokens.css` and asserts every text pairing clears WCAG AA, so a palette edit that regresses contrast fails the build. These are pure-function tests; no DOM, no SvelteKit runtime needed.
- **Build-output assertions** in [`scripts/verify-build.mjs`](svelte-app/scripts/verify-build.mjs) crack open every prerendered artwork and residence page and check the actual HTML files for the things unit tests can't see — exactly one `<title>` per page, canonical URLs pointing at `https://heshmat.zmo.de`, the JSON-LD `@type` matching the route, the Google Search Console verification meta tag landing on every page, no `localhost` leaks, sitemap listing every artwork directory, every referenced artwork image having a generated WebP derivative, and so on.
- **Playwright + axe** exercise the real production UI: filter/URL synchronisation, keyboard search, panel and modal focus, mobile overflow and touch targets, route-level accessibility, and the guarantee that a direct collection-grid visit does not load MapLibre or CARTO.
- **Lighthouse budgets** run against the collection route, enforcing performance, accessibility, best-practices and SEO score floors plus a 350 KiB JavaScript-transfer ceiling.

## Adding a new artwork

1. Copy `src/lib/data/artworks/_template.ts`.
2. Rename it (e.g., `035-new-artwork.ts`).
3. Fill in the fields (see the template for documentation).
4. Drop any images into `originals/`, then generate their WebP derivatives (see [Images](#images)).
5. Done — `index.ts` auto-imports all artwork files via `import.meta.glob`, the next build emits a new `/artworks/<slug>/` page and adds it to `sitemap.xml`.

The slug is auto-derived from `name`. To pin a stable URL when renaming, set `slug: 'my-stable-slug'` explicitly. A build error is thrown if two artworks would resolve to the same slug.

### Images

Originals (some up to ~18 MB, a few in browser-unfriendly formats like HEIC/TIFF) are never served — they live in `originals/`, outside `static/`, so they are archived in the repository but excluded from the deployed site. The app loads generated WebP derivatives:

- `originals/<file>` — the committed original (not deployed).
- `static/images/thumb/<stem>.webp` — `<=400px`, the thumbnail strips.
- `static/images/web/<stem>.webp` — `<=1200px`, the sidebar gallery and the small `srcset` candidate.
- `static/images/full/<stem>.webp` — `<=2000px`, the lightbox on large and high-DPI screens.

Filenames are normalised to NFC on the way out, and the URL helpers normalise before
percent-encoding. This is not cosmetic: a macOS-decomposed "ä" encodes to `%CC%88`, which static
hosts resolving paths in NFC answer 404 for — ten images were silently missing from the deployed
site for exactly this reason. Tests assert that derivatives and data references stay NFC.

The gallery and lightbox both ship a `srcset` spanning the last two, with a `sizes` hint describing the slot, so the browser picks by viewport and pixel density rather than always taking the largest file.

After adding or replacing any image in `originals/`, regenerate the derivatives and commit them:

```bash
# from svelte-app/
npm run images
git add originals static/images
```

The script is incremental (only new or changed files are processed), converts HEIC/TIFF, and bakes in EXIF orientation. A master that emits decoder warnings is still accepted, and one that will not decode at all falls back to re-encoding from the largest derivative already on disk — this archive contains a couple of each. In the data files always reference the **original** filename (e.g. `"My Sculpture.jpeg"`); the app maps it to the `.webp` derivative by swapping the extension, so a `.jpg`/`.jpeg` mismatch still resolves. `npm run verify:build` fails if a referenced image has no derivative — catching typos and forgotten regenerations. Images whose source file isn't available yet are tracked in the `KNOWN_MISSING` allowlist near the top of [`scripts/verify-build.mjs`](svelte-app/scripts/verify-build.mjs).

### Git LFS

`svelte-app/originals/` is tracked by [Git LFS](https://git-lfs.com) — see
[`svelte-app/.gitattributes`](svelte-app/.gitattributes). Install the client once per machine:

```bash
git lfs install
```

**This is a forward-only arrangement.** Images added or replaced from now on are stored as LFS
objects. The 139 files committed before the switch remain ordinary git blobs in history, so the
existing ~283 MB is still there and a fresh clone is unchanged in size. Converting those too means
rewriting history (`git lfs migrate import`) and force-pushing `main`, which changes every commit
hash and invalidates every existing clone and open pull request — a deliberate, coordinated
operation, not something to do casually.

Two things to know before leaning on it further:

- **Bandwidth is the binding constraint, not storage.** GitHub's free tier allows 1 GB of LFS
  storage and 1 GB of transfer per month. At this collection's size a handful of full clones would
  exhaust the monthly transfer, after which fetches fail until the quota resets or a data pack is
  bought. Check what ZMO's plan actually includes before migrating the history.
- **CI deliberately does not fetch LFS content.** Nothing in the build or the test suite reads
  image bytes — the data-integrity test only compares filenames, and the derivatives under
  `static/images/` are committed as ordinary files. So `actions/checkout` runs without `lfs: true`,
  which keeps CI off the bandwidth quota entirely.

The one workflow that does need the real files is regenerating derivatives. If `npm run images`
reports that files are LFS pointers, fetch them first:

```bash
git lfs pull
npm run images
```

Because these masters are never deployed and only their _filenames_ matter to the test suite, the
alternative worth considering is moving them out of git altogether — to institutional storage or a
Zenodo deposit with a DOI, which suits an archival project better than LFS — leaving a committed
manifest for the integrity test to read.

### Data schema

Each artwork file exports a single object with these fields:

| Field          | Type                    | Required | Description                                             |
| -------------- | ----------------------- | -------- | ------------------------------------------------------- |
| `id`           | `number`                | Yes      | Unique identifier                                       |
| `name`         | `string`                | Yes      | Artwork or site name                                    |
| `lat`, `lng`   | `number`                | Yes      | Coordinates (decimal degrees)                           |
| `country`      | `string`                | Yes      | Country (used for filter chips)                         |
| `city`         | `string`                | Yes      | City or locality                                        |
| `status`       | `'located' \| 'search'` | Yes      | Whether the artwork has been found                      |
| `address`      | `string`                | Yes      | Street address or Plus Code                             |
| `desc`         | `string`                | Yes      | Description (HTML allowed)                              |
| `slug`         | `string`                | No       | URL slug override (auto-derived from `name` if omitted) |
| `image`        | `string`                | No       | Single image filename in `originals/`                   |
| `imageCaption` | `string`                | No       | Credit line for single image                            |
| `images`       | `ArtworkImage[]`        | No       | Multiple images with captions                           |
| `links`        | `ArtworkLink[]`         | No       | External reference URLs                                 |
| `video`        | `string`                | No       | YouTube URL (auto-embedded)                             |
| `videoFile`    | `string`                | No       | Filename of a self-hosted clip in `static/videos/`      |
| `videoCaption` | `string`                | No       | Credit line shown beneath the local video               |
| `movement`     | `ArtworkMovement`       | No       | Relocation data (from-coordinates, year)                |

Places of residence use a parallel schema in `src/lib/data/residences/` — the same identity and image fields, plus a `years` string, and no `status` or `movement`. See `residences/_template.ts`.

## Deployment

The site is built and deployed by the `build` and `deploy` jobs in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) on every push to `main`:

1. Install deps with `npm ci`.
2. Run lint, typecheck and unit tests once on Node 24.
3. Build and assert the static artifact on Node 22 and 24.
4. Run Playwright, axe and Lighthouse against the Node 24 production build.
5. Upload that tested Node 24 build as the Pages artifact and publish it via `actions/deploy-pages`.

**One-off setup in GitHub:**

- **Settings → Pages → Build and deployment: GitHub Actions** (not "Deploy from branch").
- After DNS for `heshmat.zmo.de` is in place: same page, **Custom domain: `heshmat.zmo.de`**, then **Enforce HTTPS** once Let's Encrypt issues the cert.

**DNS** (managed by ZMO IT, not by this repo):

- Type `CNAME`, host `heshmat`, target `zmo-berlin.github.io.`

The verification meta tag for Google Search Console lives in [`svelte-app/src/app.html`](svelte-app/src/app.html) so it appears on every page.

## Credits

- **Concept:** Jan Purtzel, ZMO
- **Content:** Dr Sonja Hegasy, ZMO
- **Development:** [Frédérick Madore](https://www.frederickmadore.com/), University of Bayreuth
- [www.zmo.de](http://www.zmo.de)
