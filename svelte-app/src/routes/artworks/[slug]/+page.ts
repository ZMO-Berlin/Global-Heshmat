import { error } from '@sveltejs/kit';
import { allSlugs, getArtworkBySlug } from '$lib/data/artworks';
import type { EntryGenerator, PageLoad } from './$types';

// Tell the prerenderer the full set of valid slugs so every artwork gets
// its own /artworks/<slug>/index.html written at build time. Without this,
// SvelteKit would only prerender pages it can reach by crawling links.
export const entries: EntryGenerator = () => allSlugs.map((slug) => ({ slug }));

// Skip prerendering entirely while the artworks folder is empty — the strict
// prerender check would otherwise fail on "route declared but never reached".
// Once the first artwork file is added, this flips to true and every slug
// gets its own /artworks/<slug>/index.html.
export const prerender = allSlugs.length > 0;

export const load: PageLoad = ({ params }) => {
	const artwork = getArtworkBySlug(params.slug);
	if (!artwork) {
		error(404, `No artwork found with slug "${params.slug}"`);
	}
	return { artwork };
};
