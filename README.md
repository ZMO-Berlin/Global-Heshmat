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
│   │   ├── ci.yml                   # Lint, type-check, build matrix
│   │   └── deploy.yml               # Build + publish to GitHub Pages
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
    │   │   │   ├── Header.svelte          # Top navigation bar
    │   │   │   ├── Legend.svelte          # Map legend
    │   │   │   ├── AboutModal.svelte      # Project info & credits overlay
    │   │   │   └── Seo.svelte             # Per-page meta tags & JSON-LD
    │   │   ├── data/
    │   │   │   ├── types.ts               # TypeScript interfaces
    │   │   │   ├── artworks.ts            # Aggregated export + slug index
    │   │   │   ├── about.ts               # About modal content
    │   │   │   └── artworks/              # One file per artwork (auto-loaded)
    │   │   │       ├── _template.ts       # Copy this to add a new artwork
    │   │   │       └── index.ts           # Auto-imports via import.meta.glob
    │   │   ├── stores/
    │   │   │   └── map.svelte.ts          # Shared reactive state (Svelte 5 runes)
    │   │   ├── utils/
    │   │   │   └── slug.ts                # URL slug helper
    │   │   └── config.ts                  # SITE_URL, site metadata, URL helpers
    │   ├── routes/
    │   │   ├── +layout.svelte             # Page chrome (Header, FilterBar, MapView, Sidebar, …)
    │   │   ├── +layout.ts                 # prerender, ssr, trailingSlash settings
    │   │   ├── +page.svelte               # Home — SEO + back-compat ?artwork= redirect
    │   │   ├── artworks/[slug]/
    │   │   │   ├── +page.ts               # entries() for prerender, load() for artwork
    │   │   │   └── +page.svelte           # Per-artwork SEO + store sync
    │   │   └── sitemap.xml/+server.ts     # Prerendered sitemap.xml
    │   ├── app.html                       # Includes Google Search Console verification
    │   └── app.d.ts
    ├── static/
    │   ├── CNAME                          # heshmat.zmo.de — picked up by GitHub Pages
    │   ├── robots.txt                     # Points crawlers at /sitemap.xml
    │   └── images/                        # Artwork photos
    ├── package.json
    ├── svelte.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

## Routes & URLs

| URL | What it serves |
|---|---|
| `/` | Map view with no artwork preselected |
| `/artworks/<slug>/` | Same map, sidebar pre-opened on the artwork; one prerendered HTML file per artwork |
| `/sitemap.xml` | Auto-generated sitemap listing the home and every artwork URL |
| `/robots.txt` | Allows all crawlers; points to the sitemap |

Each `/artworks/<slug>/` page is fully prerendered to static HTML at build time with its own `<title>`, `<meta>` description, Open Graph tags, Twitter Card, and JSON-LD `VisualArtwork` schema — so search engines and link-unfurlers (Slack, Twitter, etc.) see real per-artwork metadata, not a generic homepage.

Legacy `/?artwork=<id>` links are auto-redirected to the new canonical URLs on the client.

## Features

- **Interactive WebGL map** — MapLibre GL JS with CartoDB Voyager basemap
- **Marker clustering** — groups nearby markers, click to zoom in
- **Three marker types** — located (teal), to-be-found (orange), ghost markers for relocated artworks (dashed outline)
- **Relocation visualisation** — dashed lines connecting original and current locations
- **Country & status filters** — filter chips auto-generated from data
- **Real-time search** — searches across names, cities, countries, and addresses
- **Sidebar detail view** — images, description, status tags, address, external links
- **Multi-image gallery** — thumbnail strip, prev/next navigation, image counter
- **Full-screen lightbox** — keyboard navigation (arrow keys, Escape)
- **YouTube video embeds** — inline in the sidebar
- **Per-artwork URLs** — each artwork has its own prerendered `/artworks/<slug>/` page for deep-linking, sharing, and indexing
- **SEO & structured data** — per-page `<title>`, canonical URL, Open Graph, Twitter Card, and JSON-LD (Schema.org `VisualArtwork` / `WebSite`)
- **Auto-generated sitemap** — `sitemap.xml` enumerates every artwork URL at build time
- **Responsive design** — works on mobile and desktop
- **Keyboard navigation** — Escape to close panels, arrow keys in lightbox

## Development

```bash
cd svelte-app
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (writes `svelte-app/build/`) |
| `npm run preview` | Preview production build |
| `npm run check` | Type-check with svelte-check |
| `npm run lint` | Prettier check + ESLint |
| `npm run format` | Format with Prettier |
| `npm test` | Run Vitest unit tests once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run verify:build` | Assert the `build/` artifact has the expected SEO + sitemap content |
| `npm run validate` | format:check + lint + check + test + build + verify:build (run before committing) |

## Testing

Two layers, both run in CI:

- **Vitest unit tests** live next to the source as `*.test.ts`. They cover the SEO/URL/sitemap surface — `slugify`, `escapeXml`, the `artworkPath` / `absoluteUrl` helpers, and the slug-collision check in `buildArtworkIndex`. These are pure-function tests; no DOM, no SvelteKit runtime needed.
- **Build-output assertions** in [`scripts/verify-build.mjs`](svelte-app/scripts/verify-build.mjs) crack open the prerendered `build/` directory and check the actual HTML files for the things unit tests can't see — exactly one `<title>` per page, canonical URLs pointing at `https://heshmat.zmo.de`, the JSON-LD `@type` matching the route, the Google Search Console verification meta tag landing on every page, no `localhost` leaks, sitemap listing every artwork directory, and so on.

## Adding a new artwork

1. Copy `src/lib/data/artworks/_template.ts`.
2. Rename it (e.g., `032-new-artwork.ts`).
3. Fill in the fields (see the template for documentation).
4. Drop any images into `static/images/`.
5. Done — `index.ts` auto-imports all artwork files via `import.meta.glob`, the next build emits a new `/artworks/<slug>/` page and adds it to `sitemap.xml`.

The slug is auto-derived from `name`. To pin a stable URL when renaming, set `slug: 'my-stable-slug'` explicitly. A build error is thrown if two artworks would resolve to the same slug.

### Data schema

Each artwork file exports a single object with these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | Yes | Unique identifier |
| `name` | `string` | Yes | Artwork or site name |
| `lat`, `lng` | `number` | Yes | Coordinates (decimal degrees) |
| `country` | `string` | Yes | Country (used for filter chips) |
| `city` | `string` | Yes | City or locality |
| `status` | `'located' \| 'search'` | Yes | Whether the artwork has been found |
| `address` | `string` | Yes | Street address or Plus Code |
| `desc` | `string` | Yes | Description (HTML allowed) |
| `slug` | `string` | No | URL slug override (auto-derived from `name` if omitted) |
| `image` | `string` | No | Single image filename in `static/images/` |
| `imageCaption` | `string` | No | Credit line for single image |
| `images` | `ArtworkImage[]` | No | Multiple images with captions |
| `links` | `ArtworkLink[]` | No | External reference URLs |
| `video` | `string` | No | YouTube URL (auto-embedded) |
| `movement` | `ArtworkMovement` | No | Relocation data (from-coordinates, year) |

## Deployment

The site is built and deployed by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push to `main`:

1. Install deps with `npm ci`.
2. Build the static site with `npm run build` (output: `svelte-app/build/`).
3. Upload it as a Pages artifact and publish via `actions/deploy-pages`.

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
