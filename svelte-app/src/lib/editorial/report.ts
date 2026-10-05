import { artworks } from '$lib/data/artworks';
import { residences } from '$lib/data/residences';
import { validateEntry } from './validate';
export function editorialReport() {
	const entries = [...artworks, ...residences];
	const issues = entries.flatMap((item) => validateEntry(item));
	return {
		generatedOn: new Date().toISOString(),
		records: entries.length,
		errors: issues.filter((issue) => issue.severity === 'error'),
		warnings: issues.filter((issue) => issue.severity === 'warning')
	};
}
