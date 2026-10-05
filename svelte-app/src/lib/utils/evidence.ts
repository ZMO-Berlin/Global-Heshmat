import type { DocumentaryMetadata } from '$lib/data/types';
export function locationZoom(item: DocumentaryMetadata): number {
	return item.locationPrecision === 'exact'
		? 14
		: item.locationPrecision === 'approximate'
			? 12
			: item.locationPrecision === 'city' || item.locationPrecision === 'last-known'
				? 10
				: 11;
}
export function precisionLabel(item: DocumentaryMetadata): string {
	const labels = {
		exact: 'Documented location',
		approximate: 'Approximate location',
		city: 'City-level location',
		'last-known': 'Last known location'
	};
	return item.locationPrecision
		? labels[item.locationPrecision]
		: 'Location precision not yet documented';
}
