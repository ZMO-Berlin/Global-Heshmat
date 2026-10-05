/** Derivative geometry shared by the encoder, manifest checks and browser. */
export const VARIANTS = [
	{ dir: 'thumb', size: 400, quality: 75 },
	{ dir: 'preview', size: 800, quality: 72 },
	{ dir: 'web', size: 1200, quality: 80 },
	{ dir: 'full', size: 2000, quality: 80 }
];
/** @param {string} file */
export const imageStem = (file) => file.normalize('NFC').replace(/\.[^./\\]+$/, '');
/** @param {string[]} files */
export function assertUniqueStems(files) {
	const seen = new Map();
	for (const file of files) {
		const key = imageStem(file).toLocaleLowerCase('en');
		if (seen.has(key)) throw new Error(`Image filename collision: ${seen.get(key)} and ${file}`);
		seen.set(key, file);
	}
}
