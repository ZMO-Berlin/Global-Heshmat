import { describe, expect, it } from 'vitest';
import type { Entry } from './collection';
import { coverImage, matchesMediaId } from './collection';
import { leadImage } from './image';
import { citation, bibtex, ris, csvCell, exportRecords } from './exports';
import { entryStructuredData } from './structured-data';
import { locationZoom } from './evidence';
import {
	trackingParameter,
	validateEntry,
	validatePerson,
	validDate
} from '$lib/editorial/validate';
import { artworks } from '$lib/data/artworks';
import { people } from '$lib/data/people';
const fixture: Entry = {
	id: 1,
	name: 'Research & archive',
	slug: 'research-archive',
	kind: 'artwork',
	lat: 30,
	lng: 31,
	city: 'Cairo',
	country: 'Egypt',
	status: 'located',
	address: '',
	desc: ''
};
describe('media resolution', () => {
	const images = [{ src: 'first.jpg' }, { src: 'second.jpg', id: 'permanent-second' }];
	it.each(['second.jpg', 'second', 'permanent-second'])(
		'shares the %s cover across cards and SEO',
		(cover) => {
			expect(coverImage({ images, coverImage: cover })?.src).toBe('second.jpg');
			expect(leadImage({ images, coverImage: cover })).toBe('second.jpg');
		}
	);
	it('falls back predictably and preserves filename-based shared links', () => {
		expect(leadImage({ images, coverImage: 'missing' })).toBe('first.jpg');
		expect(matchesMediaId(images[1], 'second')).toBe(true);
	});
});
describe('research exports and structured data', () => {
	it('cites a record without inventing a publication date or personal author', () => {
		expect(citation(fixture, '2026-09-29', 'abcdef1234567890', 'build1')).toContain('n.d.');
		expect(citation(fixture, '2026-09-29', 'abcdef1234567890', 'build1')).toContain(
			'Version abcdef123456 (build build1)'
		);
		expect(bibtex(fixture, '2026-09-29')).toContain('Research \\& archive');
		expect(bibtex(fixture, '2026-09-29')).toMatch(/^@misc\{global-heshmat-artwork-1,\n/);
		expect(ris({ ...fixture, name: 'Title\nUR  - forged' }, '2026-09-29')).toContain(
			'TI  - Title UR  - forged\r\n'
		);
	});
	it('keeps editorial and media rights separate', () => {
		const result = exportRecords([artworks[0]], '2026-09-29');
		expect(result.editorialLicense).toContain('creativecommons.org');
		expect(result.mediaRights).toContain('separately copyrighted');
		expect(result.records[0].images[0].rights).toContain('permission');
	});
	it.each(['=SUM(A1)', '+cmd', '-cmd', '@SUM(A1)', '\t=1'])(
		'neutralizes spreadsheet formula %s',
		(value) => expect(csvCell(value)).toMatch(/^"'/)
	);
	it('escapes quoted CSV fields', () =>
		expect(csvCell('A "quoted", title')).toBe('"A ""quoted"", title"'));
	it('emits creation evidence only when provided, and does not credit an institution building to the artist', () => {
		expect(entryStructuredData(fixture)).not.toHaveProperty('locationCreated');
		expect(
			entryStructuredData({ ...fixture, creationPlace: { name: 'Verified studio' } })
		).toHaveProperty('locationCreated.name', 'Verified studio');
		const institution = entryStructuredData({ ...fixture, entryKind: 'institution' });
		expect(institution['@type']).toBe('Place');
		expect(institution).not.toHaveProperty('creator');
	});
	it('frames undocumented and city-level locations more broadly than exact locations', () => {
		expect(locationZoom({})).toBeLessThan(locationZoom({ locationPrecision: 'exact' }));
		expect(locationZoom({ locationPrecision: 'city' })).toBe(10);
	});
});
describe('editorial validation', () => {
	it('reports research gaps as warnings while allowing an existing record to build', () =>
		expect(validateEntry(fixture).filter((issue) => issue.severity === 'error')).toEqual([]));
	it.each(['2025-02-29', '2024-13', '2024-00-01', '2024-02-31'])(
		'rejects invalid date %s',
		(date) => expect(validDate(date)).toBe(false)
	);
	it('accepts calendar-valid partial dates', () => {
		for (const date of ['2024', '2024-02', '2024-02-29']) expect(validDate(date)).toBe(true);
	});
	it('rejects unsafe URLs, ambiguous media identities and false precision', () => {
		const issues = validateEntry({
			...fixture,
			status: 'search',
			locationPrecision: 'exact',
			sources: [{ label: 'Bad link', url: 'javascript:alert(1)' }],
			images: [{ src: 'first.jpg', id: 'second' }, { src: 'second.jpg' }]
		});
		expect(
			issues
				.filter((issue) => issue.severity === 'error')
				.map((issue) => issue.message)
				.join(' ')
		).toMatch(/Unsafe source.*exact current.*ambiguous/s);
	});
	it('rejects dangerous editorial HTML and invalid coordinates', () => {
		const issues = validateEntry({
			...fixture,
			lat: Number.NaN,
			desc: '<script>alert(1)</script><a href="jav&#x61;script:alert(1)">bad</a>'
		});
		expect(issues.filter((issue) => issue.severity === 'error')).toHaveLength(3);
	});
	it('rejects tracking parameters and citations left in People passages', () => {
		expect(trackingParameter('https://example.org/a/?utm_source=chatgpt.com')).toBe('utm_source');
		expect(trackingParameter('https://example.org/a/?page=2')).toBeUndefined();
		const issues = validatePerson({
			...people[0],
			paragraphs: ['A passage. (Source: https://example.org/?utm_source=chatgpt.com )'],
			notes: [],
			sources: [{ label: 'Article', url: 'https://example.org/?fbclid=1' }]
		});
		expect(issues.map((issue) => issue.message).join(' ')).toMatch(
			/Source: ….*"utm_source".*"fbclid"/s
		);
	});
	it('accepts every published People profile', () => {
		for (const person of people)
			expect(validatePerson(person).filter((issue) => issue.severity === 'error')).toEqual([]);
	});
});
