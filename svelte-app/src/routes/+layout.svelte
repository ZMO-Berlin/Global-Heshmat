<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- closeHref is built from resolve() in the browse store. */
	import '../app.css';
	import '@fontsource-variable/cormorant-garamond/wght.css';
	import '@fontsource-variable/cormorant-garamond/wght-italic.css';
	import '@fontsource-variable/outfit/wght.css';
	import cormorantLatin from '@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2?url';
	import cormorantItalicLatin from '@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-italic.woff2?url';
	import outfitLatin from '@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2?url';
	import { onMount, type Snippet } from 'svelte';
	import { page } from '$app/state';
	import { goto, afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import logo from '$lib/assets/logo-zmo.png';
	import Header from '$lib/components/Header.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import CollectionView from '$lib/components/CollectionView.svelte';
	import MissingDossier from '$lib/components/MissingDossier.svelte';
	import CollectionPanel from '$lib/components/CollectionPanel.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import AboutModal from '$lib/components/AboutModal.svelte';
	import { createFieldbook } from '$lib/stores/fieldbook.svelte';
	import { createBrowseStore } from '$lib/stores/browse.svelte';
	let { children }: { children: Snippet } = $props();
	const store = createBrowseStore();
	createFieldbook();
	// SvelteKit card clicks do not fetch an HTML document. Save it explicitly,
	// including a first visit that happens before the service worker activates.
	afterNavigate(({ to }) => {
		const path = to?.url.pathname;
		if (!path || !/^\/(artworks|residences)\//.test(path) || !('serviceWorker' in navigator))
			return;
		void navigator.serviceWorker.ready
			.then(async () => {
				const { cacheEntryDocument } = await import('$lib/offline/client');
				await cacheEntryDocument(path);
			})
			.catch(() => {});
	});
	type MapConstructor = (typeof import('$lib/components/MapView.svelte'))['default'];
	let MapComponent = $state<MapConstructor>();
	let mapView: import('$lib/components/MapView.svelte').default | undefined = $state();
	let mapFailed = $state(false);
	let importing = false;
	let wasSelected = false;
	const isCollection = $derived(page.route.id === '/collection');
	const isMissing = $derived(page.route.id === '/missing');
	let keepMissing = $state(page.route.id === '/missing');
	$effect(() => {
		if (isMissing) keepMissing = true;
	});
	const isMap = $derived(store.view === 'map');
	let keepCollection = $state(page.route.id === '/collection');
	$effect(() => {
		if (isCollection) keepCollection = true;
	});
	async function loadMap() {
		if (importing || MapComponent) return;
		importing = true;
		mapFailed = false;
		try {
			MapComponent = (await import('$lib/components/MapView.svelte')).default;
		} catch {
			mapFailed = true;
		} finally {
			importing = false;
		}
	}
	$effect(() => {
		if (isMap) void loadMap();
	});
	$effect(() => {
		if (!store.selection && wasSelected && store.returnKey) {
			const key = store.returnKey;
			requestAnimationFrame(() =>
				Array.from(document.querySelectorAll<HTMLElement>(`[data-entry-key="${CSS.escape(key)}"]`))
					.find((el) => el.getClientRects().length > 0)
					?.focus({ preventScroll: true })
			);
		}
		wasSelected = !!store.selection;
	});
	onMount(() => {
		let timer: ReturnType<typeof setTimeout>;
		const register = () => {
			timer = setTimeout(
				() =>
					void import('virtual:pwa-register')
						.then(({ registerSW }) => registerSW())
						.catch(() => {}),
				3000
			);
		};
		if (document.readyState === 'complete') register();
		else window.addEventListener('load', register, { once: true });
		return () => {
			window.removeEventListener('load', register);
			clearTimeout(timer);
		};
	});
	function resetView() {
		store.resetFilters();
		mapView?.resetView();
		void goto(resolve('/'));
	}
</script>

<svelte:head
	><meta name="collection-build" content={__BUILD_ID__} /><link
		rel="icon"
		href={logo}
		type="image/png"
	/><link
		rel="preload"
		href={cormorantLatin}
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/><link
		rel="preload"
		href={cormorantItalicLatin}
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/><link
		rel="preload"
		href={outfitLatin}
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/></svelte:head
>
<svelte:window
	onkeydown={(event) => {
		if (event.key !== 'Escape') return;
		if (store.aboutOpen) store.aboutOpen = false;
		else if (store.browseOpen) store.browseOpen = false;
		else if (store.selection && !store.photo) void goto(store.closeHref, { noScroll: true });
	}}
/>
<a class="skip-link" href="#main-content">Skip to the collection</a>
<Header onreset={resetView} />
<FilterBar />
<main id="main-content" tabindex="-1">
	{@render children()}
	{#if keepMissing}<div hidden={!isMissing} inert={!isMissing}><MissingDossier /></div>{/if}
	{#if keepCollection}<div hidden={!isCollection} inert={!isCollection}>
			<CollectionView />
		</div>{/if}
	{#if MapComponent}<div hidden={!isMap} inert={!isMap}>
			<MapComponent bind:this={mapView} showStatus={isMap} />
		</div>{/if}
	{#if isMap && mapFailed}<div class="map-import-error" role="status">
			<p>The map could not be loaded.</p>
			<button onclick={loadMap}>Retry map</button><a href={resolve('/collection')}
				>Browse the gallery</a
			>
		</div>{/if}
	{#if isMap}<CollectionPanel />{/if}
</main>
{#if isMap}<Legend />{/if}
<Footer />
<AboutModal />

<style>
	.map-import-error {
		position: fixed;
		inset: calc(var(--header-height) + var(--filter-height)) 0 var(--footer-height);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: var(--space-4);
		background: var(--color-surface-warm);
	}
	.map-import-error button,
	.map-import-error a {
		padding: var(--space-3);
		min-height: 44px;
		color: var(--color-primary-text);
	}
</style>
