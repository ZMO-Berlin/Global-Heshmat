import sharp from 'sharp';
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { VARIANTS, imageStem, assertUniqueStems } from './image-variants.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export async function generateImageManifest(check = false) {
	const manifest = {};
	for (const { dir, size } of VARIANTS) {
		const folder = join(root, 'static/images', dir);
		const files = (await readdir(folder)).filter((file) => file.endsWith('.webp')).sort();
		assertUniqueStems(files);
		for (const file of files) {
			if (file !== file.normalize('NFC')) throw new Error(`Non-NFC image filename: ${file}`);
			const source = join(folder, file);
			const { width, height } = await sharp(source).metadata();
			if (!width || !height) throw new Error(`Cannot read image dimensions: ${file}`);
			if (Math.max(width, height) > size)
				throw new Error(
					`Oversized ${dir} derivative: ${file} (${width} × ${height}; maximum ${size})`
				);
			const stem = imageStem(file);
			manifest[stem] ??= {};
			manifest[stem][dir] = { width, height, bytes: (await stat(source)).size };
		}
	}
	for (const [stem, variants] of Object.entries(manifest)) {
		if (VARIANTS.some(({ dir }) => !variants[dir]))
			throw new Error(`Incomplete derivatives: ${stem}`);
	}
	const output = JSON.stringify(manifest, null, '\t') + '\n';
	const destination = join(root, 'src/lib/data/image-manifest.json');
	if (check) {
		if ((await readFile(destination, 'utf8')).replaceAll('\r\n', '\n') !== output) {
			throw new Error('Image manifest is stale. Run npm run images:manifest.');
		}
	} else await writeFile(destination, output);
	console.log(`Image manifest: ${Object.keys(manifest).length} images verified.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	await generateImageManifest(process.argv.includes('--check'));
}
