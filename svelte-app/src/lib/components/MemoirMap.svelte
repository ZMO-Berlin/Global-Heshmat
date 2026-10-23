<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	// The same worker and Arabic shaping set-up as MapView (see the comments there).
	import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
	import rtlTextPluginUrl from '$rtl-text-plugin?url';
	import type * as Maplibre from 'maplibre-gl';
	import { pageLabel, type MemoirEntity } from '$lib/data/memoir';
	import { countLabel } from '$lib/utils/text';
	import type { FeatureCollection } from '$lib/utils/geojson';
	import { X } from '@lucide/svelte';

	let { places }: { places: MemoirEntity[] } = $props();

	let container: HTMLDivElement;
	let map: Maplibre.Map | undefined;
	let destroyed = false;
	let loadTimeout: ReturnType<typeof setTimeout> | undefined;
	let status = $state<'loading' | 'ready' | 'failed'>('loading');
	// The popup's content is this component's own markup (with the site's close
	// button), handed to MapLibre, which only positions it.
	let popupContent = $state<HTMLDivElement>();
	let selected = $state<MemoirEntity>();
	let popup: Maplibre.Popup | undefined;

	const css = (name: string) =>
		getComputedStyle(document.documentElement).getPropertyValue(name).trim();

	function geojson(): FeatureCollection<
		{ type: 'Point'; coordinates: [number, number] },
		{ id: string; mentions: number }
	> {
		return {
			type: 'FeatureCollection',
			features: places.map((place) => ({
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [place.lng!, place.lat!] },
				properties: { id: place.id, mentions: place.mentions }
			}))
		};
	}

	async function initialize() {
		status = 'loading';
		map?.remove();
		map = undefined;
		try {
			const maplibregl = await import('maplibre-gl');
			if (destroyed) return;
			maplibregl.setWorkerUrl(workerUrl);
			if (maplibregl.getRTLTextPluginStatus() === 'unavailable') {
				void maplibregl.setRTLTextPlugin(rtlTextPluginUrl, true).catch(() => {});
			}
			const instance = new maplibregl.Map({
				container,
				style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
				center: [20, 32],
				zoom: 1.6,
				attributionControl: false,
				cooperativeGestures: true
			});
			map = instance;
			instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
			instance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
			loadTimeout = setTimeout(() => {
				if (!instance.isStyleLoaded()) status = 'failed';
			}, 15_000);
			instance.on('error', () => {
				if (!instance.isStyleLoaded()) {
					status = 'failed';
					if (loadTimeout) clearTimeout(loadTimeout);
				}
			});
			instance.on('load', () => {
				if (loadTimeout) clearTimeout(loadTimeout);
				status = 'ready';
				instance.addSource('places', { type: 'geojson', data: geojson() });
				instance.addLayer({
					id: 'places',
					type: 'circle',
					source: 'places',
					paint: {
						// Area, not radius, follows the number of mentions.
						'circle-radius': [
							'interpolate',
							['linear'],
							['sqrt', ['get', 'mentions']],
							1,
							5,
							5,
							18
						],
						'circle-color': css('--color-header-bg'),
						'circle-opacity': 0.72,
						'circle-stroke-color': css('--color-accent'),
						'circle-stroke-width': 1.5
					}
				});
				const bounds = new maplibregl.LngLatBounds();
				for (const place of places) bounds.extend([place.lng!, place.lat!]);
				instance.fitBounds(bounds, { padding: 40, duration: 0 });

				const byId = new Map(places.map((place) => [place.id, place]));
				popup = new maplibregl.Popup({ closeButton: false, maxWidth: '280px' });
				popup.on('close', () => (selected = undefined));
				instance.on('click', 'places', (event) => {
					const feature = event.features?.[0];
					const place = feature && byId.get(String(feature.properties.id));
					if (!place) return;
					selected = place;
					popup!.setLngLat([place.lng!, place.lat!]).setDOMContent(popupContent!).addTo(instance);
				});
				instance.on('mouseenter', 'places', () => (instance.getCanvas().style.cursor = 'pointer'));
				instance.on('mouseleave', 'places', () => (instance.getCanvas().style.cursor = ''));
			});
		} catch {
			if (!destroyed) status = 'failed';
		}
	}

	onMount(() => void initialize());
	onDestroy(() => {
		destroyed = true;
		if (loadTimeout) clearTimeout(loadTimeout);
		map?.remove();
	});
</script>

<div class="memoir-map">
	<div bind:this={container} class="canvas"></div>
	<div hidden>
		<div bind:this={popupContent} class="memoir-popup">
			{#if selected}
				<div class="popup-head">
					<strong class="popup-name" dir="auto">{selected.name}</strong>
					<button
						class="btn-close"
						type="button"
						onclick={() => popup?.remove()}
						aria-label="Close"
					>
						<X size={16} strokeWidth={2.25} />
					</button>
				</div>
				<span class="popup-ar" lang="ar" dir="rtl">{selected.nameAr}</span>
				<span class="popup-meta"
					>{countLabel(selected.mentions, 'mention')} · {pageLabel(selected.pages, 8)}</span
				>
			{/if}
		</div>
	</div>
	{#if status !== 'ready'}
		<div class="status" class:failed={status === 'failed'} role="status" aria-live="polite">
			{#if status === 'failed'}
				<p>The map could not be loaded. Every place is also listed below.</p>
				<button type="button" onclick={() => void initialize()}>Retry map</button>
			{:else}
				<p>Loading the map&hellip;</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.memoir-map {
		position: absolute;
		inset: 0;
	}
	.canvas {
		position: absolute;
		inset: 0;
	}
	.status {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding: var(--space-5);
		text-align: center;
		pointer-events: none;
	}
	.status.failed {
		pointer-events: auto;
	}
	/* The page's `.research-inner button` style (a 44px bordered box) must not
	   reach MapLibre's own controls and popup. */
	.canvas :global(.maplibregl-ctrl-group button) {
		width: 40px;
		height: 40px;
		min-height: 0;
		padding: 0;
		border: 0;
		border-radius: 0;
		background-color: transparent;
	}
	.canvas :global(.maplibregl-ctrl-group button + button) {
		border-top: 1px solid var(--color-border);
	}
	.canvas :global(.maplibregl-popup-content) {
		padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
	}
	.memoir-popup {
		display: grid;
		gap: var(--space-1);
		font-family: var(--font-body);
	}
	.popup-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
	}
	/* The site's .btn-close at popup scale, restored over the page's .research-inner button style. */
	.memoir-popup .btn-close {
		width: 28px;
		height: 28px;
		min-height: 0;
		padding: 0;
		border: none;
		border-radius: 50%;
		background: var(--color-close-bg);
		color: var(--color-text-muted);
	}
	.memoir-popup .btn-close:hover {
		background: var(--color-close-bg-hover);
		color: var(--color-text);
	}
	.popup-name {
		padding-top: 2px;
		font: var(--weight-semibold) var(--text-lg) / var(--leading-snug) var(--font-display);
		color: var(--color-ink);
	}
	.popup-ar {
		font-size: var(--text-md);
		color: var(--color-text-secondary);
	}
	.popup-meta {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}
	@media (pointer: coarse) {
		.canvas :global(.maplibregl-ctrl-group button) {
			width: 44px;
			height: 44px;
		}
	}
</style>
