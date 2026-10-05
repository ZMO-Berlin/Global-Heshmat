import { test } from 'node:test';
import assert from 'node:assert/strict';
import { optionalMapAssets } from '../../scripts/map-assets.mjs';
test('map budget detects renamed renderer chunks from logical manifest metadata', () => {
	const assets = optionalMapAssets({
		'_opaque.js': {
			name: 'maplibre',
			file: '_app/immutable/chunks/opaque.js',
			css: ['renderer.css']
		},
		shared: { file: 'shared.js' },
		'src/lib/components/MapView.svelte': { file: 'view.js', assets: ['worker.js'] }
	});
	assert.deepEqual(
		[...assets],
		['/_app/immutable/chunks/opaque.js', '/renderer.css', '/view.js', '/worker.js']
	);
	assert.throws(() => optionalMapAssets({}), /not found/);
});
