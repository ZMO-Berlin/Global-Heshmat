/**
 * Fold accents, Arabic vowel marks and tatweel for archive discovery.
 * Apostrophes are dropped and other punctuation becomes a space, because the
 * sources mix typographic and keyboard forms: "Egypt's" must find "Egypt’s",
 * and "as Sigini" must find "as-Sigini".
 */
export function normalizeSearchText(value: string): string {
	return (
		value
			.normalize('NFKD')
			.replace(/\p{M}/gu, '')
			.replace(/\u0640/g, '')
			.replace(/[ٱ]/g, 'ا')
			.replace(/ى/g, 'ي')
			// Apostrophes, plus the ʾ/ʿ hamza and ayn of scholarly transliteration.
			.replace(/['`‘’ʻʼʾʿ]/g, '')
			.replace(/[\p{P}\p{S}]+/gu, ' ')
			.replace(/\s+/g, ' ')
			.toLocaleLowerCase('en')
			.trim()
	);
}
