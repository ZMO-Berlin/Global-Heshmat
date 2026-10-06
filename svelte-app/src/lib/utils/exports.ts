import { SITE_URL, SITE_NAME, PUBLISHER } from '$lib/config';
import {
	entryKey,
	entryPath,
	entryStatus,
	entryTitle,
	entryImages,
	mediaId,
	type Entry
} from './collection';
import { webUrl } from './image';
export const EDITORIAL_LICENSE = 'https://creativecommons.org/licenses/by/4.0/';
export const MEDIA_RIGHTS =
	'Photographs and videos are separately copyrighted; permission may be required. See individual credits.';
export function recordUrl(item: Entry): string {
	return SITE_URL + entryPath(item);
}
export function citation(
	item: Entry,
	accessed: string,
	revision = __REVISION__,
	build = __BUILD_ID__
): string {
	return `${PUBLISHER.name}. “${entryTitle(item)}.” ${SITE_NAME}, ${item.updatedOn ?? 'n.d'}. Record ${entryKey(item)}. Version ${revision.slice(0, 12)} (build ${build}). ${recordUrl(item)}. Accessed ${accessed}.`;
}
const bibEscape = (text: string) =>
	text
		.replace(/[\\{}%&#_$~^]/g, (character) => {
			const replacements: Record<string, string> = {
				'\\': '\\textbackslash{}',
				'~': '\\textasciitilde{}',
				'^': '\\textasciicircum{}'
			};
			return replacements[character] ?? '\\' + character;
		})
		.replace(/[\r\n]+/g, ' ');
export function bibtex(item: Entry, accessed: string): string {
	const fields = {
		title: entryTitle(item),
		author: `{${PUBLISHER.name}}`,
		howpublished: SITE_NAME,
		url: recordUrl(item),
		urldate: accessed,
		note: `Record ${entryKey(item)}; version ${__REVISION__}; build ${__BUILD_ID__}`,
		...(item.updatedOn ? { year: item.updatedOn.slice(0, 4) } : {})
	};
	return `@misc{global-heshmat-${entryKey(item).replace(':', '-')},\n${Object.entries(fields)
		.map(
			([key, value]) =>
				`  ${key} = {${key === 'author' ? `{${bibEscape(PUBLISHER.name)}}` : bibEscape(value)}}`
		)
		.join(',\n')}\n}\n`;
}
const risLine = (value: string) => value.replace(/[\r\n]+/g, ' ');
export function ris(item: Entry, accessed: string): string {
	return (
		[
			['TY', 'ELEC'],
			['TI', entryTitle(item)],
			['AU', `${PUBLISHER.name},`],
			['T2', SITE_NAME],
			['UR', recordUrl(item)],
			['Y2', accessed],
			['N1', `Record ${entryKey(item)}; version ${__REVISION__}; build ${__BUILD_ID__}`],
			...(item.updatedOn ? [['DA', item.updatedOn]] : []),
			['ER', '']
		]
			.map(([key, value]) => `${key}  - ${risLine(value)}`)
			.join('\r\n') + '\r\n'
	);
}
export function exportRecords(items: Entry[], accessed?: string) {
	return {
		schemaVersion: 1,
		collection: SITE_NAME,
		revision: __REVISION__,
		build: __BUILD_ID__,
		accessed,
		editorialLicense: EDITORIAL_LICENSE,
		mediaRights: MEDIA_RIGHTS,
		records: items.map((item) => ({
			...item,
			key: entryKey(item),
			url: recordUrl(item),
			images: entryImages(item).map((image) => ({
				...image,
				id: mediaId(image),
				url: SITE_URL + webUrl(image.src),
				rights: image.rights ?? MEDIA_RIGHTS
			}))
		}))
	};
}
export function csvCell(value: unknown): string {
	// Spreadsheet formula injection applies even to trusted records copied into a spreadsheet.
	let text = value == null ? '' : String(value);
	if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
	return `"${text.replace(/"/g, '""')}"`;
}
export function csv(items: Entry[], accessed: string): string {
	const fields = [
		'key',
		'title',
		'city',
		'country',
		'status',
		'latitude',
		'longitude',
		'locationPrecision',
		'url',
		'updatedOn',
		'revision',
		'build',
		'accessed',
		'editorialLicense',
		'mediaRights'
	];
	const rows = items.map((item) => [
		entryKey(item),
		entryTitle(item),
		item.city,
		item.country,
		entryStatus(item),
		item.lat,
		item.lng,
		item.locationPrecision ?? 'undocumented',
		recordUrl(item),
		item.updatedOn ?? '',
		__REVISION__,
		__BUILD_ID__,
		accessed,
		EDITORIAL_LICENSE,
		MEDIA_RIGHTS
	]);
	return [fields, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
export function download(text: string, filename: string, type = 'text/plain;charset=utf-8') {
	const url = URL.createObjectURL(new Blob([text], { type }));
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
