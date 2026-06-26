import { error } from '@sveltejs/kit';
import { allResidenceSlugs, getResidenceBySlug } from '$lib/data/residences';
import type { EntryGenerator, PageLoad } from './$types';

// Tell the prerenderer the full set of valid slugs so every residence gets
// its own /residences/<slug>/index.html written at build time. Without this,
// SvelteKit would only prerender pages it can reach by crawling links, and the
// map markers navigate via JS (no crawlable <a>).
export const entries: EntryGenerator = () => allResidenceSlugs.map((slug) => ({ slug }));

// Skip prerendering entirely while the residences folder is empty — the strict
// prerender check would otherwise fail on "route declared but never reached".
export const prerender = allResidenceSlugs.length > 0;

export const load: PageLoad = ({ params }) => {
	const residence = getResidenceBySlug(params.slug);
	if (!residence) {
		error(404, `No place of residence found with slug "${params.slug}"`);
	}
	return { residence };
};
