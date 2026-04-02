# Global Heshmat

**Following the Egyptian Sculptor Hassan Heshmat around the world** — an interactive map of artworks in public spaces.

Built with [SvelteKit](https://svelte.dev/), [MapLibre GL JS](https://maplibre.org/), and TypeScript.

## About

Global Heshmat is a cartographic web application that traces the public artworks of the Egyptian sculptor Hassan Heshmat (1920–2006) across the globe. The project currently tracks **30 artwork locations** across **8 countries** (Egypt, Belgium, France, Germany, Netherlands, Poland, Sweden, and the USA).

A project by the [Leibniz-Zentrum Moderner Orient (ZMO)](http://www.zmo.de), Berlin.

## Tech stack

- **Framework:** [SvelteKit](https://svelte.dev/) (Svelte 5 with runes)
- **Map:** [MapLibre GL JS](https://maplibre.org/) with CartoDB Voyager vector tiles
- **Language:** TypeScript
- **Build:** Vite
- **Lint/Format:** ESLint + Prettier (with Svelte plugins)

## Project structure

```
Global-Heshmat/
└── svelte-app/
    ├── src/
    │   ├── lib/
    │   │   ├── components/           # Svelte components
    │   │   │   ├── MapView.svelte          # MapLibre map, markers, clusters, relocation lines
    │   │   │   ├── Sidebar.svelte          # Artwork detail panel
    │   │   │   ├── Gallery.svelte          # Image carousel with thumbnails
    │   │   │   ├── Lightbox.svelte         # Full-screen image viewer
    │   │   │   ├── FilterBar.svelte        # Country/status filters + search
    │   │   │   ├── Header.svelte           # Top navigation bar
    │   │   │   ├── Legend.svelte            # Map legend
    │   │   │   ├── AboutModal.svelte        # Project info & credits overlay
    │   │   │   └── Seo.svelte              # Dynamic meta tags & JSON-LD
    │   │   ├── data/
    │   │   │   ├── types.ts                # TypeScript interfaces
    │   │   │   ├── artworks.ts             # Aggregated artwork export
    │   │   │   ├── about.ts                # About modal content
    │   │   │   └── artworks/               # One file per artwork (auto-loaded)
    │   │   │       ├── _template.ts        # Copy this to add a new artwork
    │   │   │       ├── index.ts            # Auto-imports via import.meta.glob
    │   │   │       └── 001-*.ts … 030-*.ts # 30 artwork data files
    │   │   └── stores/
    │   │       ├── map.svelte.ts           # Shared reactive state (Svelte 5 runes)
    │   │       └── url.svelte.ts           # Bidirectional URL ↔ state sync
    │   ├── routes/
    │   │   ├── +layout.svelte              # Global styles & fonts
    │   │   └── +page.svelte                # Main page composing all components
    │   ├── app.html
    │   └── app.d.ts
    ├── static/
    │   └── images/                         # Artwork photos
    ├── package.json
    ├── svelte.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

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
- **URL state sync** — `?artwork=<id>` parameter for deep-linking and sharing
- **SEO & structured data** — Open Graph, Twitter Cards, and JSON-LD (Schema.org VisualArtwork)
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
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run check` | Type-check with svelte-check |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## Adding a new artwork

1. Copy `src/lib/data/artworks/_template.ts`
2. Rename it (e.g., `031-new-artwork.ts`)
3. Fill in the fields (see the template for documentation)
4. Drop any images into `static/images/`
5. Done — `index.ts` auto-imports all artwork files via `import.meta.glob`

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
| `image` | `string` | No | Single image filename in `static/images/` |
| `imageCaption` | `string` | No | Credit line for single image |
| `images` | `ArtworkImage[]` | No | Multiple images with captions |
| `links` | `ArtworkLink[]` | No | External reference URLs |
| `video` | `string` | No | YouTube URL (auto-embedded) |
| `movement` | `ArtworkMovement` | No | Relocation data (from-coordinates, year) |

## Credits

- **Concept:** Jan Purzel, ZMO
- **Content:** Dr Sonja Hegasy, ZMO
- **Development:** [Frédérick Madore](https://www.frederickmadore.com/), University of Bayreuth
- [www.zmo.de](http://www.zmo.de)
