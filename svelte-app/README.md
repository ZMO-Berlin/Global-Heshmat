# Global Heshmat

**Following the Egyptian Sculptor Hassan Heshmat around the world** — an interactive map of artworks in public spaces.

Built with [SvelteKit](https://svelte.dev/), [MapLibre GL JS](https://maplibre.org/), and TypeScript.

## Tech stack

- **Framework:** SvelteKit (Svelte 5 with runes)
- **Map:** MapLibre GL JS with vector tiles (OpenFreeMap)
- **Language:** TypeScript 6
- **Build:** Vite 8
- **Lint:** ESLint + eslint-plugin-svelte
- **Format:** Prettier + prettier-plugin-svelte

## Project structure

```
svelte-app/
├── src/
│   ├── lib/
│   │   ├── components/       # Svelte components
│   │   │   ├── MapView.svelte      # MapLibre map with markers, clusters, lines
│   │   │   ├── Sidebar.svelte      # Artwork detail panel
│   │   │   ├── Gallery.svelte      # Image gallery with thumbnails
│   │   │   ├── Lightbox.svelte     # Full-screen image viewer
│   │   │   ├── FilterBar.svelte    # Country/status filters + search
│   │   │   ├── Header.svelte       # Top navigation bar
│   │   │   ├── Legend.svelte       # Map legend
│   │   │   └── AboutModal.svelte   # About overlay
│   │   ├── data/
│   │   │   ├── types.ts            # TypeScript interfaces
│   │   │   ├── artworks.ts         # Aggregated export
│   │   │   └── artworks/           # One file per artwork (auto-loaded)
│   │   │       ├── _template.ts    # Copy this to add a new artwork
│   │   │       ├── index.ts        # Auto-imports all artwork files
│   │   │       ├── 001-the-agricultural-museum.ts
│   │   │       ├── 002-museum-of-modern-egyptian-art.ts
│   │   │       └── ...             # 30 artwork files total
│   │   └── stores/
│   │       └── map.svelte.ts       # Shared reactive state (Svelte 5 runes)
│   ├── routes/
│   │   ├── +layout.svelte          # Global styles (CSS variables)
│   │   └── +page.svelte            # Main page assembling all components
│   └── app.html
├── static/
│   └── images/                     # Artwork photos
├── eslint.config.js
├── .prettierrc
└── package.json
```

## Adding a new artwork

1. Copy `src/lib/data/artworks/_template.ts`
2. Rename it (e.g., `031-new-artwork.ts`)
3. Fill in the fields
4. Drop any images into `static/images/`
5. Done — the `index.ts` auto-imports all artwork files via `import.meta.glob`

## Development

```bash
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
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |

## Features

- **Interactive map** with MapLibre GL JS vector tiles (WebGL)
- **Marker clustering** with zoom-to-expand
- **Country & status filters** — filter by location or "To be found"
- **Real-time search** across artwork names, cities, and addresses
- **Sidebar** with artwork details, metadata tags, and external links
- **Multi-image gallery** with thumbnail strip and full-screen lightbox
- **Relocation visualisation** — dashed lines and ghost markers for moved artworks
- **YouTube video embeds** in sidebar
- **Responsive design** — works on mobile and desktop
- **Keyboard navigation** — Escape to close, arrow keys in lightbox
- **CSS variables** for consistent theming

## Credits

- **Concept:** Jan Purzel, ZMO
- **Content:** Dr Sonja Hegasy, ZMO
- **Development:** [Frédérick Madore](https://www.frederickmadore.com/), University of Bayreuth
- [www.zmo.de](http://www.zmo.de)
