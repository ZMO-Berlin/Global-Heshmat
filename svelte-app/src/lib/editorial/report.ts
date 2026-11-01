import { artworks } from '#lib/data/artworks.js';
import { residences } from '#lib/data/residences.js';
import { people } from '#lib/data/people.js';
import { validateEntry, validatePerson } from './validate';
export function editorialReport() {
	const entries = [...artworks, ...residences];
	const issues = [
		...entries.flatMap((item) => validateEntry(item)),
		...people.flatMap((person) => validatePerson(person))
	];
	return {
		generatedOn: new Date().toISOString(),
		records: entries.length + people.length,
		errors: issues.filter((issue) => issue.severity === 'error'),
		warnings: issues.filter((issue) => issue.severity === 'warning')
	};
}
