/**
 * Convert a free-form name into a URL-safe slug.
 * - Lowercased, ASCII-only, words joined by single hyphens.
 * - Strips diacritics so "Café d'Aïcha" → "cafe-d-aicha".
 */
export function slugify(input: string): string {
	return input
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
