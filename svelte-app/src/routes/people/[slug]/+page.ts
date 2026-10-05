import { error } from '@sveltejs/kit';
import { people, getPersonBySlug } from '$lib/data/people';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;
export const entries: EntryGenerator = () => people.map(({ slug }) => ({ slug }));
export const load: PageLoad = ({ params }) => {
	const person = getPersonBySlug(params.slug);
	if (!person) error(404, 'Person not found');
	return { person };
};
