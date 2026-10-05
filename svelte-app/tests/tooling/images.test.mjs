import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, readdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { generateDerivatives, render } from '../../scripts/generate_image_derivatives.mjs';
import { assertUniqueStems } from '../../scripts/image-variants.mjs';
const logger = { log() {}, error() {} };
async function fixture(t) {
	const root = await mkdtemp(join(tmpdir(), 'heshmat-images-'));
	t.after(() => rm(root, { recursive: true, force: true }));
	await mkdir(join(root, 'originals'));
	return root;
}
async function image(path, color = 'red') {
	await sharp({ create: { width: 80, height: 40, channels: 3, background: color } })
		.jpeg()
		.withMetadata({ orientation: 6 })
		.toFile(path);
}
test('normalizes output names, rotates EXIF, skips unchanged images, and restores missing variants', async (t) => {
	const root = await fixture(t);
	await image(join(root, 'originals', 'Cafe\u0301.jpg'));
	const options = { root, logger };
	assert.equal((await generateDerivatives(options)).written, 4);
	const file = join(root, 'static/images/web/Café.webp');
	const metadata = await sharp(await readFile(file)).metadata();
	assert.equal(metadata.width, 40);
	assert.equal(metadata.height, 80);
	const before = (await stat(file)).mtimeMs;
	assert.equal((await generateDerivatives(options)).skipped, 4);
	assert.equal((await stat(file)).mtimeMs, before);
	await rm(file);
	const regenerated = await generateDerivatives(options);
	assert.equal(regenerated.written, 1);
	assert.equal(regenerated.skipped, 3);
	assert.equal(
		(await generateDerivatives({ ...options, encoderSignature: 'changed-encoder' })).written,
		4
	);
	await image(join(root, 'originals', 'Cafe\u0301.jpg'), 'blue');
	assert.equal((await generateDerivatives(options)).written, 4);
});
test('rejects case, extension and Unicode stem collisions before writing', () => {
	for (const files of [
		['A.jpg', 'a.png'],
		['Café.jpg', 'Cafe\u0301.tif']
	])
		assert.throws(() => assertUniqueStems(files), /collision/);
});
test('reports LFS pointers with no decode attempt', async (t) => {
	const root = await fixture(t);
	await writeFile(
		join(root, 'originals', 'pointer.jpg'),
		'version https://git-lfs.github.com/spec/v1\noid sha256:abc\nsize 100\n'
	);
	const result = await generateDerivatives({
		root,
		logger,
		renderImage: () => {
			throw new Error('must not decode a pointer');
		}
	});
	assert.equal(result.failed, 1);
	assert.deepEqual(result.pointers, ['pointer.jpg']);
});
test('retains a known good full derivative when a master cannot decode and rebuilds smaller images', async (t) => {
	const root = await fixture(t);
	const source = join(root, 'originals', 'archive.jpg');
	await image(source);
	await generateDerivatives({ root, logger });
	const full = join(root, 'static/images/full/archive.webp');
	const preserved = await readFile(full);
	await writeFile(source, 'undecodable master');
	const result = await generateDerivatives({ root, logger });
	assert.equal(result.written, 3);
	assert.equal(result.failed, 1);
	assert.deepEqual(await readFile(full), preserved);
});
test('an interrupted/failed encode does not replace a derivative or leave temporary files', async (t) => {
	const root = await fixture(t);
	const source = join(root, 'originals', 'broken.jpg');
	await writeFile(source, 'invalid');
	const output = join(root, 'previous.webp');
	await writeFile(output, 'previous valid data');
	await assert.rejects(render(source, output, 400, 75));
	assert.equal(await readFile(output, 'utf8'), 'previous valid data');
	assert.ok(!(await readdir(root)).some((file) => file.endsWith('.tmp')));
});
