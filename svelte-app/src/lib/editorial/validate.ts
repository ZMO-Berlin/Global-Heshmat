import { parseFragment, type DefaultTreeAdapterMap } from 'parse5';
import {
	entryImages,
	mediaId,
	legacyMediaId,
	matchesMediaId,
	entryKey,
	isToBeFound,
	type Entry
} from '$lib/utils/collection';
import type { SourceReference } from '$lib/data/types';
export interface DataIssue {
	record: string;
	severity: 'error' | 'warning';
	message: string;
}
export function validDate(value: string, full = false): boolean {
	if (!/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(value) || (full && value.length !== 10)) return false;
	const normalized =
		value.length === 4 ? `${value}-01-01` : value.length === 7 ? `${value}-01` : value;
	const date = new Date(normalized);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === normalized;
}
export function safeUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
	} catch {
		return false;
	}
}
export function validateEntry(
	item: Entry,
	today = new Date().toISOString().slice(0, 10)
): DataIssue[] {
	const issues: DataIssue[] = [];
	const issue = (message: string, severity: DataIssue['severity'] = 'error') =>
		issues.push({ record: entryKey(item), severity, message });
	const coordinates = (lat: number, lng: number, label: string) => {
		if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180)
			issue(`Invalid ${label} coordinates`);
	};
	if (!Number.isSafeInteger(item.id) || item.id <= 0) issue('ID must be a positive integer');
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug))
		issue('Slug must be a safe permanent lowercase path segment');
	for (const field of ['name', 'country', 'city'] as const)
		if (!item[field].trim()) issue(`Missing ${field}`);
	coordinates(item.lat, item.lng, 'record');
	if (item.creationPlace) {
		if (!item.creationPlace.name.trim()) issue('Creation place requires a name');
		if (item.creationPlace.lat !== undefined || item.creationPlace.lng !== undefined)
			coordinates(item.creationPlace.lat!, item.creationPlace.lng!, 'creation place');
	}
	if ('movement' in item && item.movement) {
		coordinates(item.movement.fromLat, item.movement.fromLng, 'previous location');
		if (!Number.isInteger(item.movement.year) || item.movement.year < 1)
			issue('Movement year must be a positive integer');
	}
	const validateSource = (source: SourceReference) => {
		if (!source.label.trim()) issue('Source label is empty');
		if (source.url && !safeUrl(source.url)) issue(`Unsafe source URL: ${source.url}`);
		if (source.checkedOn && !validDate(source.checkedOn, true))
			issue(`Invalid verification date: ${source.checkedOn}`);
		else if (source.checkedOn && source.checkedOn > today)
			issue(`Verification date is in the future: ${source.checkedOn}`);
		else if (
			source.checkedOn &&
			Date.parse(today) - Date.parse(source.checkedOn) > 2 * 365.25 * 86400000
		)
			issue(`Source last checked more than two years ago: ${source.label}`, 'warning');
	};
	for (const source of item.sources ?? []) validateSource(source);
	if (!item.sources?.length) issue('Structured source references missing', 'warning');
	if (!item.locationPrecision) issue('Location precision missing', 'warning');
	if (!item.entryKind) issue('Entity kind missing', 'warning');
	if (isToBeFound(item) && item.locationPrecision === 'exact')
		issue('Unlocated work cannot claim an exact current location; use last-known or approximate');
	if (item.updatedOn && (!validDate(item.updatedOn, true) || item.updatedOn > today))
		issue('Invalid record update date');
	const images = entryImages(item);
	const identities = new Map<string, number>();
	images.forEach((image, index) => {
		if (!image.src || /[\\/]/.test(image.src) || image.src !== image.src.normalize('NFC'))
			issue(`Unsafe or non-NFC image filename: ${image.src}`);
		for (const id of new Set([mediaId(image), legacyMediaId(image)])) {
			if (!id.trim() || [...id].some((character) => character.charCodeAt(0) < 32))
				issue('Media ID must be nonempty and printable');
			if (identities.has(id) && identities.get(id) !== index)
				issue(`Duplicate or ambiguous media ID: ${id}`);
			identities.set(id, index);
		}
		if (image.date && !validDate(image.date)) issue(`Invalid structured image date: ${image.date}`);
		if (image.sourceUrl && !safeUrl(image.sourceUrl))
			issue(`Unsafe image source URL: ${image.sourceUrl}`);
		for (const field of ['id', 'alt', 'credit', 'date', 'rights'] as const)
			if (!image[field]) issue(`Image ${index + 1}: ${field} missing`, 'warning');
	});
	if (
		item.coverImage &&
		!images.some(
			(image) => image.src === item.coverImage || matchesMediaId(image, item.coverImage!)
		)
	)
		issue('Cover does not resolve to an album image');
	if ('links' in item)
		for (const link of item.links ?? [])
			if (!safeUrl(link.url)) issue(`Unsafe external URL: ${link.url}`);
	if ('video' in item && item.video && !safeUrl(item.video)) issue('Unsafe video URL');
	const eventIds = new Set();
	for (const event of item.events ?? []) {
		if (!event.id.trim() || eventIds.has(event.id))
			issue(`Empty or duplicate event ID: ${event.id}`);
		eventIds.add(event.id);
		if (
			!validDate(event.date) ||
			(event.endDate && (!validDate(event.endDate) || event.endDate < event.date))
		)
			issue(`Invalid event date interval: ${event.id}`);
		if (!event.sources.length) issue(`Event requires source references: ${event.id}`);
		event.sources.forEach(validateSource);
	}
	const allowed = new Set([
		'p',
		'br',
		'em',
		'strong',
		'b',
		'i',
		'u',
		'a',
		'span',
		'ul',
		'ol',
		'li',
		'sup',
		'sub'
	]);
	const fragment = parseFragment(item.desc, {
		onParseError: (error) => issue(`Malformed description HTML: ${error.code}`)
	});
	function walk(node: DefaultTreeAdapterMap['node']) {
		if ('tagName' in node) {
			if (!allowed.has(node.tagName))
				issue(`Unsupported description HTML element: ${node.tagName}`);
			for (const attr of node.attrs) {
				if (!['href', 'target', 'rel', 'lang', 'dir', 'title'].includes(attr.name))
					issue(`Unsupported HTML attribute: ${attr.name}`);
				if (attr.name === 'href' && !safeUrl(attr.value))
					issue(`Unsafe description link: ${attr.value}`);
			}
			if (
				node.attrs.some((attr) => attr.name === 'target' && attr.value === '_blank') &&
				!node.attrs.some(
					(attr) => attr.name === 'rel' && attr.value.split(/\s+/).includes('noopener')
				)
			)
				issue('New-window link requires rel="noopener"');
		}
		if ('childNodes' in node) node.childNodes.forEach(walk);
	}
	walk(fragment);
	return issues;
}
