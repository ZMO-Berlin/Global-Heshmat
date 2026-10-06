/** "1 photo", "3 photos", "1 entry", "2 entries" — an English count with its noun. */
export function countLabel(count: number, singular: string, plural = `${singular}s`): string {
	return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Plain text from a repository-owned HTML description (search, meta tags,
 * JSON-LD). Tags become spaces so "Hasselt<br>Belgium" keeps its word break.
 */
export function plainText(html: string): string {
	return html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}
