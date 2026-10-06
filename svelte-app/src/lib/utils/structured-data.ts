import { ARTIST, SITE_NAME, SITE_URL } from '$lib/config';
import { leadImage, webUrl } from './image';
import { recordUrl } from './exports';
import type { Entry } from './collection';
import { plainText } from './text';
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
					creator: {
						'@type': 'Person',
						name: ARTIST.name,
						birthDate: ARTIST.birthDate,
						deathDate: ARTIST.deathDate,
						nationality: ARTIST.nationality
					},
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
		isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL }
	};
}
