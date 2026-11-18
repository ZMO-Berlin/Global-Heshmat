import type { Artwork } from '#lib/data/types.js';

/** A mailto: URL with an encoded subject and optional prefilled body. */
export function mailtoHref(email: string, subject: string, body?: string): string {
	return (
		`mailto:${email}?subject=${encodeURIComponent(subject)}` +
		(body === undefined ? '' : `&body=${encodeURIComponent(body)}`)
	);
}

/**
 * The subject of a message offering information about an artwork. The id
 * lets the research team match the message to the record even after a rename.
 */
export function artworkInfoSubject(artwork: Pick<Artwork, 'name' | 'id'>): string {
	return `Global Heshmat — information about ${artwork.name} (artwork ${artwork.id})`;
}
