import { ARTIST, SITE_NAME, SITE_URL, absoluteUrl } from '#lib/config.js';
import { leadImage, webUrl } from './image';
import { recordUrl } from './exports';
import type { Entry } from './collection';
import { plainText } from './text';
const site = () => ({ '@type': 'WebSite', name: SITE_NAME, url: SITE_URL });
const artist = () => ({
	'@type': 'Person',
	name: ARTIST.name,
	birthDate: ARTIST.birthDate,
	deathDate: ARTIST.deathDate,
	nationality: ARTIST.nationality
});

export function recordSchemaType(item: Entry): 'Place' | 'Collection' | 'VisualArtwork' {
	if (item.kind === 'residence' || item.entryKind === 'residence') return 'Place';
	return item.entryKind === 'institution'
		? 'Place'
		: item.entryKind === 'ensemble'
			? 'Collection'
			: 'VisualArtwork';
}
export function entryStructuredData(item: Entry) {
	const type = recordSchemaType(item);
	const isWork = type === 'VisualArtwork' || type === 'Collection';
	const cover = leadImage(item);
	return {
		'@context': 'https://schema.org',
		'@type': type,
		name: item.name,
		description: plainText(item.desc).slice(0, 300),
		url: recordUrl(item),
		image: cover ? SITE_URL + webUrl(cover) : undefined,
		...(isWork
			? {
					creator: artist(),
					...(item.creationPlace
						? { locationCreated: { '@type': 'Place', name: item.creationPlace.name } }
						: {})
				}
			: {
					address: {
						'@type': 'PostalAddress',
						addressLocality: item.city,
						addressCountry: item.country
					},
					...(item.locationPrecision === 'exact'
						? { geo: { '@type': 'GeoCoordinates', latitude: item.lat, longitude: item.lng } }
						: {})
				}),
		isPartOf: site()
	};
}

/**
 * Only what the profile states: its name, a literal excerpt and its page. The
 * caller passes path and excerpt so Seo, on every page, does not bundle the
 * people helpers.
 */
export function personStructuredData(person: { name: string; path: string; excerpt: string }) {
	const url = absoluteUrl(person.path);
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: person.name,
		description: person.excerpt,
		url,
		subjectOf: { '@type': 'WebPage', url, isPartOf: site() }
	};
}

/** The fields of memoir.json's `book` that describe the printed edition. */
export interface BookRecord {
	title: string;
	titleAr: string;
	publisher: string;
	publisherEn?: string;
	year: number;
	doi: string;
}
export function bookStructuredData(book: BookRecord, path = '/memoir/') {
	return {
		'@context': 'https://schema.org',
		'@type': 'Book',
		name: book.title,
		alternateName: book.titleAr,
		inLanguage: 'ar',
		datePublished: String(book.year),
		author: artist(),
		publisher: {
			'@type': 'Organization',
			name: book.publisher,
			...(book.publisherEn ? { alternateName: book.publisherEn } : {})
		},
		identifier: {
			'@type': 'PropertyValue',
			propertyID: 'DOI',
			value: book.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')
		},
		sameAs: book.doi,
		subjectOf: { '@type': 'WebPage', url: absoluteUrl(path), isPartOf: site() }
	};
}
