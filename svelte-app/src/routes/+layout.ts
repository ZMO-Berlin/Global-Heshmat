// Ship the app as a fully static site. Prerender renders the single route
// to HTML at build time; ssr=false means the client hydrates from that HTML
// and all interactivity (map, URL sync, filters) runs in the browser.
export const prerender = true;
export const ssr = false;
