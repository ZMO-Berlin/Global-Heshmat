export const VARIANTS = [
	{ dir: 'thumb', size: 400, quality: 75 },
	{ dir: 'preview', size: 800, quality: 72 },
	{ dir: 'web', size: 1200, quality: 80 },
	{ dir: 'full', size: 2000, quality: 80 }
];

export const imageStem = (file) => file.normalize('NFC').replace(/\.[^./\\]+$/, '');

export function assertUniqueStems(files) {
	const seen = new Map();
	for (const file of files) {
		const key = imageStem(file).toLocaleLowerCase('en');
		if (seen.has(key)) throw new Error(`Image filename collision: ${seen.get(key)} and ${file}`);
		seen.set(key, file);
	}
}
