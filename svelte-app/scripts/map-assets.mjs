import { readFileSync } from 'node:fs';
export function optionalMapAssets(manifest) {
	const paths = new Set();
	for (const [key, asset] of Object.entries(manifest)) {
		if (asset.name === 'maplibre' || key === 'src/lib/components/MapView.svelte') {
			paths.add('/' + asset.file);
			for (const file of [...(asset.css ?? []), ...(asset.assets ?? [])]) paths.add('/' + file);
		}
	}
	if (!paths.size) throw new Error('Optional map assets not found in the Vite manifest');
	return paths;
}
export function readMapAssets() {
	return optionalMapAssets(
		JSON.parse(
			readFileSync(
				new URL('../.svelte-kit/output/client/.vite/manifest.json', import.meta.url),
				'utf8'
			)
		)
	);
}
