import type { PersonRecord } from '../types';

const person: PersonRecord = {
	slug: 'george-mikaelian',
	name: 'George Mikaelian',
	groups: ['armenian-community'],
	places: ['Cairo'],
	sourceParagraphs: [15],
	paragraphs: [
		'George Mikaelian (1914–1986) was a bookseller and art patron in Cairo who supported young Egyptian-Armenian artists, like Shant Avetisyan, but we also know that he bought works by the young Hassan Heshmat.'
	],
	sources: [
		{
			label:
				'Lemma Shehadi, “Celebrating Chant Avedissian: the artist who put Egypt’s Golden Age in the spotlight”, The National, 11 January 2022',
			url: 'https://www.thenationalnews.com/arts-culture/art/2022/01/11/celebrating-chant-avedissian-the-artist-who-put-egypts-golden-age-in-the-spotlight/',
			checkedOn: '2026-10-08'
		}
	]
};

export default person;
