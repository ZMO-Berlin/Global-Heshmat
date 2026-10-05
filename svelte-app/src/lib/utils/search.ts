/** Fold accents, Arabic vowel marks and tatweel for archive discovery. */
export function normalizeSearchText(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/\p{M}/gu, '')
		.replace(/\u0640/g, '')
		.replace(/[ٱ]/g, 'ا')
		.replace(/ى/g, 'ي')
		.toLocaleLowerCase('en')
		.trim();
}
