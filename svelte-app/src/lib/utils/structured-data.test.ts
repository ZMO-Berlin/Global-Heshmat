import { describe, expect, it } from 'vitest';
import { ARTIST, SITE_URL } from '#lib/config.js';
import { memoirBook } from '#lib/data/memoir.js';
import { people } from '#lib/data/people.js';
import { personExcerpt, personPath } from './people';
import { bookStructuredData, personStructuredData } from './structured-data';

describe('person structured data', () => {
	const person = people[0];
	const data = personStructuredData({
		name: person.name,
		path: personPath(person.slug),
		excerpt: personExcerpt(person)
	});
	it('names the profile and links its canonical page within the site', () => {
		expect(data['@type']).toBe('Person');
		expect(data.name).toBe(person.name);
		expect(data.url).toBe(`${SITE_URL}/people/${person.slug}/`);
		expect(data.subjectOf).toMatchObject({ url: data.url, isPartOf: { url: SITE_URL } });
	});
	it('describes with the literal source excerpt and adds no facts the profile lacks', () => {
		expect(data.description).toBe(personExcerpt(person));
		for (const key of ['birthDate', 'deathDate', 'nationality', 'jobTitle', 'sameAs'])
			expect(data).not.toHaveProperty(key);
	});
});

describe('book structured data', () => {
	const data = bookStructuredData(memoirBook);
	it('describes the printed edition from the memoir record', () => {
		expect(data).toMatchObject({
			'@type': 'Book',
			name: memoirBook.title,
			alternateName: memoirBook.titleAr,
			datePublished: String(memoirBook.year),
			inLanguage: 'ar',
			publisher: { name: memoirBook.publisher, alternateName: memoirBook.publisherEn },
			author: { '@type': 'Person', name: ARTIST.name },
			sameAs: memoirBook.doi
		});
		expect(data.identifier.value).toMatch(/^10\.\d+\//);
		expect(data.subjectOf.url).toBe(`${SITE_URL}/memoir/`);
	});
	it('omits an English publisher name the record does not give', () => {
		expect(
			bookStructuredData({ ...memoirBook, publisherEn: undefined }).publisher
		).not.toHaveProperty('alternateName');
	});
	it('stays inert inside a script tag once Seo escapes it', () => {
		const json = JSON.stringify(
			bookStructuredData({ ...memoirBook, title: '</script><b>' })
		).replace(/</g, '\\u003c');
		expect(json).not.toContain('<');
		expect(JSON.parse(json).name).toBe('</script><b>');
	});
});
