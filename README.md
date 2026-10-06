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

| Path | Purpose |
| --- | --- |
| `.github/workflows/` | Quality gates, browser tests, Pages deployment, dependency audit and live smoke check |
| `svelte-app/src/lib/components/` | Collection views, map, albums, research tools and modal controls |
| `svelte-app/src/lib/data/` | One TypeScript file per artwork, residence and People profile, shared schema and generated image manifest |
| `svelte-app/src/lib/stores/browse.svelte.ts` | Context-scoped filters, selection, URL state and modal history |
| `svelte-app/src/lib/stores/fieldbook.svelte.ts` | Device-local research selections |
| `svelte-app/src/lib/editorial/` | Data validation and research-quality reporting |
| `svelte-app/src/lib/offline/` | Canonical cache keys, version rules, saved albums and availability checks |
| `svelte-app/src/lib/media/` | Shared derivative definitions and filename normalization |
| `svelte-app/src/lib/utils/` | Indexing, search, GeoJSON, citations/exports, structured data and accessibility helpers |
| `svelte-app/src/routes/` | Static record pages, collection, missing dossier, fieldbook, trails, metadata export and sitemap |
| `svelte-app/src/service-worker.ts` | Workbox precache and version-aware runtime caching |
| `svelte-app/originals/` | Preserved masters; never deployed |
| `svelte-app/static/images/{thumb,preview,web,full}/` | Committed WebP derivatives |
| `svelte-app/scripts/` | Image generation, validation, build assertions, upgrade and performance checks |
| `svelte-app/tests/` | Browser/accessibility regressions and temporary image-pipeline fixtures |

## Routes & URLs

| URL                   | What it serves                                                                     |
| --------------------- | ---------------------------------------------------------------------------------- |
| `/`                   | Map view with no artwork preselected                                               |
| `/artworks/<slug>/`   | Prerendered album and record; add `?view=map` for the map sidebar |
| `/collection/`        | Albums, grouped photographs and list, with combinable filters                      |
| `/residences/<slug>/` | Same, for the places where Heshmat lived or worked                                 |
| `/people/`            | People connected to Heshmat, with source-group and place facets |
| `/people/<slug>/`     | Prerendered profile with its source passages and related records |
| `/missing/`           | Dedicated dossier of unlocated works |
| `/fieldbook/`         | Device-local selections, exports and offline album management |
| `/trails/`            | Place-based reading sequences |
| `/collection.json`    | Versioned public collection metadata and media-rights statements |
| `/sitemap.xml`        | Auto-generated sitemap listing the home page and every artwork, residence and People URL |
| `/robots.txt`         | Allows all crawlers; points to the sitemap                                         |
| anything else         | `404.html` fallback, which renders `+error.svelte`                                 |

Each `/artworks/<slug>/` page is fully prerendered to static HTML at build time with its own `<title>`, `<meta>` description, Open Graph tags, Twitter Card, and entity-aware JSON-LD (`VisualArtwork`, `Collection` or `Place`) — so search engines and link-unfurlers (Slack, Twitter, etc.) see real per-artwork metadata, not a generic homepage.

Legacy `/?artwork=<id>` links are auto-redirected to the new canonical URLs on the client.

## Features

- **Interactive WebGL map** — MapLibre GL JS with CartoDB Voyager basemap
- **Marker clustering** — groups nearby markers, click to zoom in
- **Three artwork marker types** — located (teal), to-be-found (orange), ghost markers for relocated artworks (dashed outline)
- **Relocation visualisation** — dashed lines connecting original and current locations
- **Places of residence** — a separate, unclustered marker layer for where Heshmat lived and worked
- **Country & status filters** — combinable country, status, entry type and text search, preserved in URLs
- **Three ways to read the collection** — the map, a photo grid at `/collection/`, and a side list, switchable from any of them. The grid also exposes works that overlap at world-map scale, especially around Cairo
- **Browsable collection index** — a grouped, filter-aware text list of every entry, opened with Browse on the map. It is also the site's internal link graph: the collection index carries real links to every entry
- **Shape-coded markers** — located (disc), to be found (ring), place of residence (diamond) and former location (dashed ring). Shape rather than hue carries the distinction: under tritanopia the located and residence colours measure ΔE 12.4, indistinguishable at marker size. `MARKER_SPECS` is the single source, so the map canvas, the legend and the list cannot drift apart
- **Real-time search** — searches names, aliases, descriptions, places, captions and source labels; folds accents and Arabic vowel marks
- **Sidebar detail view** — images, description, status tags, address, external links
- **Multi-image gallery** — thumbnail strip, prev/next navigation, image counter
- **Full-screen lightbox** — keyboard navigation (arrow keys, Escape)
- **YouTube video embeds** — inline in the sidebar
- **Per-artwork URLs** — each artwork has its own prerendered `/artworks/<slug>/` page for deep-linking, sharing, and indexing
- **SEO & structured data** — per-page `<title>`, canonical URL, Open Graph, Twitter Card, and JSON-LD (Schema.org `VisualArtwork` / `Collection` / `Place` / `WebSite`)
- **Auto-generated sitemap** — `sitemap.xml` enumerates every artwork URL at build time
- **Responsive design** — works on mobile and desktop
- **Installable PWA** — app shell precached for offline use, images cached on demand; updates apply silently, with no install or reload prompts
- **Responsive images** — four WebP sizes (400 / 800 / 1200 / 2000 px bounding boxes) served with accurate width descriptors
- **Accessibility** — skip link, `<main>` landmark, focus moved into panels as they open and restored on close, labelled native filter controls, and a palette locked to WCAG AA contrast by unit test
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
| `npm test`                | Run Vitest and isolated image-pipeline fixture tests                                                                                                                   |
| `npm run test:watch`      | Run Vitest in watch mode                                                                                                                     |
| `npm run test:e2e`        | Run Playwright browser and axe accessibility tests against the production build                                                              |
| `npm run test:lighthouse` | Check desktop/mobile collection, album and dossier Lighthouse scores and JavaScript/map-loading budgets                                      |
| `npm run audit:prod`      | Fail on high-severity advisories in production dependencies                                                                                  |
| `npm run verify:build`    | Assert the `build/` artifact has the expected SEO + sitemap content, and that every referenced artwork image has a generated WebP derivative |
| `npm run validate`        | Run lint, typecheck, unit tests, build assertions, Playwright/axe, and Lighthouse budgets                                                    |

## Testing

Four layers, all run in CI:

- **Vitest unit tests** live next to the source as `*.test.ts`. They cover the pure layer — `slugify`, `escapeXml`, the `artworkPath` / `absoluteUrl` helpers, the slug-collision checks in `buildIndex`, the map filter predicates and GeoJSON builders, the image-URL and `srcset` helpers, and YouTube id parsing. `contrast.test.ts` additionally reads the colour values straight out of `tokens.css` and asserts every text pairing clears WCAG AA, so a palette edit that regresses contrast fails the build. These are pure-function tests; no DOM, no SvelteKit runtime needed.
- **Build-output assertions** in [`scripts/verify-build.mjs`](svelte-app/scripts/verify-build.mjs) crack open every prerendered artwork and residence page and check the actual HTML files for the things unit tests can't see — exactly one `<title>` per page, canonical URLs pointing at `https://heshmat.zmo.de`, the JSON-LD `@type` matching the route, the Google Search Console verification meta tag landing on every page, no `localhost` leaks, sitemap listing every artwork directory, every referenced artwork image having a generated WebP derivative, and so on.
- **Playwright + axe** exercise the real production UI: filter/URL synchronisation, keyboard search, panel and modal focus, mobile overflow and touch targets, route-level accessibility, and the guarantee that a direct collection-grid visit does not load MapLibre or CARTO.
- **Lighthouse budgets** run three cold measurements each for the desktop/mobile collection, a mobile album and the mobile missing-works dossier. Median floors: performance 90 desktop / 85 simulated slow-4G mobile, accessibility 100, best practices 95, SEO 100; LCP ≤ 2.5 s desktop / 4 s simulated mobile, CLS ≤ 0.1, JavaScript ≤ 350 KiB. Map downloads on these pages fail the check. CI retains HTML/JSON reports and browser failure traces for 14 days. Chromium and WebKit run in CI.

## Adding a new artwork

1. Copy `src/lib/data/artworks/_template.ts`.
2. Rename it (e.g., `035-new-artwork.ts`).
3. Fill in the fields (see the template for documentation).
4. Drop any images into `originals/`; `npm run dev` watches this folder and generates WebP derivatives automatically (see [Images](#images)).
5. Done — `index.ts` auto-imports all artwork files via `import.meta.glob`, the next build emits a new `/artworks/<slug>/` page and adds it to `sitemap.xml`.

The slug is auto-derived from `name`. To pin a stable URL when renaming, set `slug: 'my-stable-slug'` explicitly. A build error is thrown if two artworks would resolve to the same slug.

## Adding a person

1. Copy `src/lib/data/people/_template.ts` and name the copy after the profile's URL slug, e.g. `jane-example.ts` for `/people/jane-example/`.
2. Fill in the fields (documented in the template). Group ids come from `_groups.ts`; a typo is a type error in `npm run check`.
3. Done — `people/index.ts` collects every profile file. The build fails if a filename and its `slug` differ, or if a `seeAlso` or shared passage (`_contexts.ts`) names an unknown profile.

Profiles reproduce the source document's wording; see [`docs/people-source.md`](svelte-app/docs/people-source.md) for the editorial rules. Slugs are permanent: correct a name without renaming the file.

### Images

Originals (some up to ~18 MB, a few in browser-unfriendly formats like HEIC/TIFF) are never served — they live in `originals/`, outside `static/`, so they are archived in the repository but excluded from the deployed site. The app loads generated WebP derivatives:

- `originals/<file>` — the committed original (not deployed).
- `static/images/thumb/<stem>.webp` — `<=400px`, the thumbnail strips.
- `static/images/preview/<stem>.webp` — `<=800px`, intermediate mobile candidate.
- `static/images/web/<stem>.webp` — `<=1200px`, the sidebar gallery and the small `srcset` candidate.
- `static/images/full/<stem>.webp` — `<=2000px`, the lightbox on large and high-DPI screens.

Filenames are normalised to NFC on the way out, and the URL helpers normalise before
percent-encoding. This is not cosmetic: a macOS-decomposed "ä" encodes to `%CC%88`, which static
hosts resolving paths in NFC answer 404 for — ten images were silently missing from the deployed
site for exactly this reason. Tests assert that derivatives and data references stay NFC.

The gallery and lightbox both ship a `srcset` spanning preview, web and full sizes, with a `sizes` hint describing the slot, so the browser picks by viewport and pixel density rather than always taking the largest file.

### Uploading new images

When `npm run dev` is running, place the original master in `svelte-app/originals/`; the dev server starts the image watcher automatically and converts new or changed images.

```bash
cd svelte-app
npm run dev
```

For a one-off conversion without starting the dev server:

```bash
cd svelte-app
npm run images
```

The watcher generates matching WebP thumbnails, web-size, and full-size variants into `static/images/{thumb,preview,web,full}/`. To keep derivatives available for deployment, commit the generated files as well as the original.

After adding or replacing any image in `originals/`, regenerate the derivatives and commit them:

```bash
# from svelte-app/
npm run images
git add originals static/images
```

The script is incremental (only new or changed files are processed), reuses each master buffer for hashing and encoding, converts HEIC/TIFF, and bakes in EXIF orientation. A master that emits decoder warnings is still accepted, and one that will not decode at all falls back to re-encoding from the largest derivative already on disk — this archive contains a couple of each. In the data files always reference the **original** filename (e.g. `"My Sculpture.jpeg"`); the app maps it to the `.webp` derivative by swapping the extension, so a `.jpg`/`.jpeg` mismatch still resolves. `npm run verify:build` fails if a referenced image has no derivative — catching typos and forgotten regenerations. Images whose source file isn't available yet are tracked in the `KNOWN_MISSING` allowlist near the top of [`scripts/verify-build.mjs`](svelte-app/scripts/verify-build.mjs).

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

- Check ZMO's current storage and bandwidth entitlements before migrating masters. Plan limits and institutional arrangements can change.
- **CI deliberately does not fetch LFS content.** The build does not read master bytes. Integrity tests decode committed derivatives and pipeline tests generate tiny temporary images. The derivatives under
  `static/images/` are committed as ordinary files. So `actions/checkout` runs without `lfs: true`,
  which keeps CI off the bandwidth quota entirely.

The one workflow that does need the real files is regenerating derivatives. If `npm run images`
reports that files are LFS pointers, fetch them first:

```bash
git lfs pull
npm run images
```

Because these masters are never deployed and tests use committed derivatives or temporary fixtures, the
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

## Licensing

This repository is deliberately licensed in three parts, because it contains three
different kinds of material:

| Material                                                                   | Licence                                                   |
| -------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Source code** — everything under `svelte-app/src`, `scripts/`            | [MIT](LICENSE)                                            |
| **Editorial content** — artwork and residence records, about texts         | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| **Photographs and video** — `originals/`, `static/images`, `static/videos` | **All rights reserved.** Not covered by either licence.   |

The photographs were generously provided by the family of Hassan Heshmat, the Hassan
Heshmat Museum, and individual photographers. They remain the property of their
respective rights-holders and may not be reused without permission. If you are a
rights-holder and believe an image has been used or attributed incorrectly, please
get in touch so it can be corrected or removed.

## Citing this project

A [`CITATION.cff`](CITATION.cff) file is included, so GitHub renders a **"Cite this
repository"** button in the sidebar with ready-made APA and BibTeX output.

The accompanying open access publication (Arabic/German) is available from the ZMO
repository: <https://repositorium.zmo.de/receive/zmo_mods_00002340>

## Contributing

Several works have not been located yet. If you recognise a statue or monument, or
know of other works by Heshmat in public space, please
[open an artwork report](https://github.com/ZMO-Berlin/Global-Heshmat/issues/new?template=artwork-location.yml)
or email <sonja.hegasy@zmo.de>.

For code changes, run the full gate before opening a pull request:

```bash
cd svelte-app && npm run validate
```

## Collection and documentary metadata

The gallery offers **Entries**, **Photos** (grouped by notice), and **List**. Every card exposes its photograph count and album previews. Albums retain complete image proportions, a contact sheet and a keyboard-operated full-screen viewer. A photo URL uses a filename-derived identifier (or an explicit media `id`), so rearranging an album does not change its shared links. Returning to the collection restores the open list's scroll and originating focus.

The **Works still to be found** dossier at `/missing/` brings together the 13 unlocated entries, existing documentation, recorded locations and a prefilled email contribution. Recorded coordinates are explicitly distinguished from a confirmed current location. No speculative locations or sources have been added.

Optional notice metadata in `src/lib/data/types.ts`: `displayTitle`, `siteName`, `district`, `aliases`, `coverImage`, `entryKind`, `locationPrecision`, `sources` (label, URL, checkedOn), and `creationPlace`. Media can include `id`, `alt`, `credit`, `date`, and `documentType`. Populate these only from documented evidence; existing source descriptions remain authoritative. Explicit slugs are permanent URLs and must not change with a title correction.

`npm run images` fingerprints source bytes plus encoder settings, serializes watch rebuilds, checks filename collisions and writes derivatives through temporary files. It refreshes the committed `src/lib/data/image-manifest.json`, whose decoded dimensions produce accurate responsive image descriptors. To inventory existing derivatives without rebuilding them use `npm run images:manifest`; `npm run verify:images` detects stale metadata or incomplete variants.

Direct entry URLs render their descriptions and album in static HTML. Gallery navigation does not initialize MapLibre. The service worker caches previously visited entry documents and provides an explicit offline fallback for an unvisited entry; photos and map areas are available offline only once cached.

## Research tools and offline behaviour

Use **Add to fieldbook** on a record, or **Use these entries** above filtered collection results. The fieldbook persists selected record IDs in local storage; it does not transmit them. Download a selected album or a whole selection, inspect the estimated image size, check current availability, and remove saved copies. JSON/CSV exports contain IDs, canonical URLs, version/build identifiers, editorial licensing and separate image rights. Entry citations can be copied or downloaded as BibTeX/RIS. The collection publisher is the corporate author; an absent editorial update date is `n.d.`, not the deployment date.

Ordinary album navigation explicitly caches its canonical HTML after service-worker readiness, including clicks before first activation. UI parameters do not create separate document keys. Reading-size images explicitly saved in the fieldbook are retained separately from the evictable browsing cache; offline requests for larger or intermediate variants fall back to that saved reading copy. Videos, external references and uncached map regions are not included. Browser storage eviction remains possible, so availability checks inspect the actual cached document and media rather than a local-storage flag.

The Workbox worker is authored in `src/service-worker.ts`. HTML caches are tied to a content-derived build ID and retired on activation of a different build. Saved selections survive, but albums need to be downloaded again after an update; old HTML is never served against a new app shell. The shell includes first-party fonts. An unseen uncached record has an explicit offline fallback.

**Place trails** currently offer geographic reading sequences for Selb and 10th of Ramadan City based on existing records. They are not verified walking routes. **Compare two images** preserves dates, captions and credits where documented without asserting chronology.

## Editorial validation and evidence

`npm run validate:data` blocks invalid IDs, slugs, coordinates, unsafe links/HTML, ambiguous media IDs, unresolved covers, invalid dates and inconsistent location claims. Every production build runs it. `npm run report:editorial` writes `editorial-report.json`; CI keeps this report as an artifact. Missing sources, precision, entity kinds, media credits/dates/rights/alt text and stale verification dates are a visible editorial backlog, not invented values or a reason to reject the existing corpus.

Optional fields include `sources: [{ label, url?, checkedOn? }]`, `updatedOn: 'YYYY-MM-DD'`, `locationPrecision`, `entryKind` and `creationPlace`. Only a documented creation place is emitted as `locationCreated`; a mapped current location does not supply it. An institution emits `Place`, without crediting its building to the artist. Undocumented/approximate locations use a broader map zoom. This is framing, not an invented uncertainty radius.

Images support durable `id`, `alt`, `credit`, `date` (year, month or full date), `documentType`, `sourceUrl`, `rightsHolder` and `rights`. Existing filename-based photo links continue to resolve after an ID is assigned. Do not rename published record slugs. Shared cover and caption helpers keep the gallery, comparison, lightbox and SEO consistent.

The optional `events` array supports sourced commissions, installations, relocations, exhibitions, residences and observations. Each event needs a stable ID, title, date, optional end date/qualifier and source references. It is rendered as an event list. Existing relocation prose is preserved; no undocumented dates or historical locations are synthesized.

The contribution issue form captures the record, observation date, location, evidence, credit and permission information. Editors verify reports before changing data. The collection primarily documents public-space work, with selected private sites and historical exhibition material as context; a listed site does not guarantee public access.

Still requiring institutional/editorial decisions: reviewed Arabic interface translations and names, dated evidence for historical chronology, rights-cleared IIIF delivery, original-asset storage/migration and required branch checks. These are not automatically enabled by the code implementation.

Validation commands for these additions:

- `npm test`: pure unit tests, real derivative integrity checks, and temporary pipeline/RTL-server fixtures.
- `npm run test:e2e`: production navigation, focus/accessibility, deterministic local map, exports and offline download/eviction scenarios.
- `npm run test:upgrade`: serves two actual builds on one origin and checks that activation retires incompatible documents; the second build runs in an isolated temporary project.
- `npm run test:lighthouse`: three cold runs per target; checks optional renderer requests against Vite's manifest as well as transfer and page-performance budgets.
- `npm run test:smoke`: checks the deployed site, intended for the scheduled workflow after release.

The image encoder remains sequential to bound memory on large masters. This change avoids redundant master reads; it does not claim a measured decoding speedup or introduce speculative parallel encoding.
