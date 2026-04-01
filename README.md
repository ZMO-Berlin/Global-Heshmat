# Global Heshmat

**Following the Egyptian Sculptor Hassan Heshmat around the world** — an interactive map of artworks in public spaces.

Built with [Leaflet.js](https://leafletjs.com/) and vanilla JavaScript. No build tools required.

## Live demo

Open `index.html` in any modern browser, or deploy to GitHub Pages / any static host.

## Project structure

```
Global-Heshmat/
├── index.html          # Main page — layout, header, sidebar, modals
├── css/
│   ├── style.css       # Core layout, markers, sidebar, responsive
│   └── gallery.css     # Gallery thumbnails & lightbox viewer
├── js/
│   ├── data.js         # Artwork entries — the single source of truth
│   ├── gallery.js      # Gallery/lightbox module (self-contained)
│   └── app.js          # Map init, markers, sidebar, filters, search
├── images/             # Artwork photos (referenced by data.js)
└── README.md
```

### Architecture

| File | Responsibility |
|------|---------------|
| `data.js` | Pure data — array of artwork objects. Edit this to add/update locations. |
| `gallery.js` | Self-contained gallery module (`Gallery.render()`, lightbox). No dependencies on app.js. |
| `app.js` | Leaflet map, marker clustering, sidebar rendering, search, filters. Calls `Gallery.render()` for image display. |
| `style.css` | Everything except the image gallery. |
| `gallery.css` | Gallery thumbnails, navigation arrows, full-screen lightbox. |

## Adding content

### Add a new artwork location

1. Open `js/data.js`
2. Copy an existing entry and change the `id` (must be unique)
3. Fill in coordinates, description, and other fields
4. See the field reference in the comments at the top of `data.js`

### Add images

**Single image:**
```js
{
  id: 99,
  name: "Example Artwork",
  image: "example.jpg",          // drop file into images/
  imageCaption: "Photo: J. Doe",
  // ...
}
```

**Multiple images (gallery with lightbox):**
```js
{
  id: 99,
  name: "Example Artwork",
  images: [
    { src: "example-1.jpg", caption: "Front view" },
    { src: "example-2.jpg", caption: "Detail" },
    { src: "example-3.jpg", caption: "Historical photo" }
  ],
  // ...
}
```

When `images` is present, the sidebar shows a gallery with:
- Thumbnail strip for quick navigation
- Previous / next arrows
- Image counter (e.g. "2 / 5")
- Click-to-expand full-screen lightbox with keyboard navigation (← → Esc)

### Add a new country filter

1. Add a filter chip in `index.html` inside `#filters`
2. Use the country name that matches your data entries

## Features

- **Interactive map** with marker clustering (Leaflet + MarkerCluster)
- **Country & status filters** — filter by location or "To be found"
- **Real-time search** across artwork names, cities, and addresses
- **Sidebar** with artwork details, metadata tags, and external links
- **Multi-image gallery** with thumbnail strip and full-screen lightbox
- **Relocation visualisation** — dashed lines and ghost markers for moved artworks
- **YouTube video embeds** in sidebar
- **Responsive design** — works on mobile and desktop
- **Keyboard navigation** — Escape to close, arrow keys in lightbox

## Dependencies

All loaded via CDN (no npm/build step):

- [Leaflet 1.9.4](https://leafletjs.com/)
- [Leaflet.markercluster 1.5.3](https://github.com/Leaflet/Leaflet.markercluster)

## Credits

- **Concept:** Jan Purzel, ZMO
- **Content:** Dr Sonja Hegasy, ZMO
- [www.zmo.de](http://www.zmo.de)
