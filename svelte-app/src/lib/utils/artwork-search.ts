import type { IndexedArtwork } from '$lib/data/types';

/** Fold case and accents so visitor spelling does not have to match the archive exactly. */
export function normalizeSearchText(value: string): string {
	return value.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en').trim();
}

/** Search the human-readable artwork fields, requiring every query word to match. */
export function searchArtworks(
	items: readonly IndexedArtwork[],
	query: string,
	limit = 8
): IndexedArtwork[] {
	const normalized = normalizeSearchText(query);
	if (normalized.length < 2 || limit <= 0) return [];

	const words = normalized.split(/\s+/);
	return items
		.filter((item) => {
			const haystack = normalizeSearchText(
				`${item.name} ${item.city} ${item.country} ${item.address}`
			);
			return words.every((word) => haystack.includes(word));
		})
		.slice(0, limit);
}
