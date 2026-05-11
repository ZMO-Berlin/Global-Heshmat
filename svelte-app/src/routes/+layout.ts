// Ship the app as a fully static site.
//
// `prerender = true`        -> every route is rendered to HTML at build time.
// `ssr` is left at its default (true) so that per-page metadata set inside
//                              <svelte:head> (title, description, OG tags,
//                              JSON-LD) actually ends up in the HTML that
//                              crawlers and link-unfurlers see. Components
//                              that touch `window` (MapView) load their
//                              browser-only deps inside `onMount`.
// `trailingSlash = 'always'` -> directory-style URLs like /artworks/foo/
//                              map cleanly to /artworks/foo/index.html on
//                              GitHub Pages.
export const prerender = true;
export const trailingSlash = 'always';
