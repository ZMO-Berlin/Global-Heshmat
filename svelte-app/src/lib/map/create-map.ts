// The MapLibre set-up both maps share. MapLibre itself is imported dynamically
// here, so a route or layout must reach this module only through a dynamic import
// of a map component: the renderer stays out of every page's initial chunks.
import 'maplibre-gl/dist/maplibre-gl.css';
// MapLibre v6 is ESM-only and resolves its worker from `import.meta.url`, which
// bundlers cannot statically analyse. Vite emits the worker as an asset here and
// `setWorkerUrl` points MapLibre at it; without this the worker 404s in the build.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import type * as Maplibre from 'maplibre-gl';

/** CARTO's Voyager basemap. */
export const BASEMAP_STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
/**
 * Some network failures stall before MapLibre emits an error; after this long
 * without a style the map counts as failed rather than leave a spinner forever.
 */
export const MAP_LOAD_TIMEOUT_MS = 15_000;

export type MapStatus = 'loading' | 'ready' | 'failed';

export interface MapHandle {
	map: Maplibre.Map;
	maplibregl: typeof Maplibre;
	/** Stops the load timeout and removes the map. */
	remove(): void;
}

/**
 * Load MapLibre and create a map on the CARTO basemap with a compact attribution.
 * `onStatus` reports loading, then ready (just before `onLoad`) or failed: when
 * MapLibre cannot be loaded or constructed, errs before the style has loaded, or
 * the style takes longer than MAP_LOAD_TIMEOUT_MS. Resolves to undefined when the
 * owner was destroyed meanwhile or the map could not be created.
 */
export async function createMap({
	container,
	options,
	attribution = 'bottom-right',
	isDestroyed,
	onStatus,
	onLoad,
	onError
}: {
	container: HTMLElement;
	options: Omit<Maplibre.MapOptions, 'container' | 'style' | 'attributionControl'>;
	attribution?: Maplibre.ControlPosition;
	isDestroyed: () => boolean;
	onStatus: (status: MapStatus) => void;
	onLoad: (map: Maplibre.Map, maplibregl: typeof Maplibre) => void;
	onError?: (event: Maplibre.ErrorEvent) => void;
}): Promise<MapHandle | undefined> {
	onStatus('loading');
	let timeout: ReturnType<typeof setTimeout> | undefined;
	try {
		const maplibregl = await import('maplibre-gl');
		if (isDestroyed()) return;
		// MapLibre shapes Arabic and orders right-to-left labels itself, so no RTL
		// text plugin is registered.
		maplibregl.setWorkerUrl(workerUrl);
		const map = new maplibregl.Map({
			...options,
			container,
			style: BASEMAP_STYLE_URL,
			attributionControl: false
		});
		map.addControl(new maplibregl.AttributionControl({ compact: true }), attribution);
		timeout = setTimeout(() => {
			if (!map.isStyleLoaded()) onStatus('failed');
		}, MAP_LOAD_TIMEOUT_MS);
		map.on('error', (event) => {
			if (!map.isStyleLoaded()) {
				onStatus('failed');
				clearTimeout(timeout);
			}
			onError?.(event);
		});
		map.on('load', () => {
			clearTimeout(timeout);
			onStatus('ready');
			onLoad(map, maplibregl);
		});
		return {
			map,
			maplibregl,
			remove() {
				clearTimeout(timeout);
				map.remove();
			}
		};
	} catch {
		clearTimeout(timeout);
		if (!isDestroyed()) onStatus('failed');
	}
}
