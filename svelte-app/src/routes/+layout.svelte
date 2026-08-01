<script lang="ts">
	import '../app.css';
	import '@fontsource-variable/cormorant-garamond/wght.css';
	import '@fontsource-variable/cormorant-garamond/wght-italic.css';
	import '@fontsource-variable/outfit/wght.css';
	import cormorantLatin from '@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2?url';
	import outfitLatin from '@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2?url';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import logo from '$lib/assets/logo-zmo.png';
	import Header from '$lib/components/Header.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import type MapView from '$lib/components/MapView.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import CollectionPanel from '$lib/components/CollectionPanel.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import AboutModal from '$lib/components/AboutModal.svelte';
	import MissingWorksModal from '$lib/components/MissingWorksModal.svelte';
	import { page } from '$app/state';
	import { getMapStore } from '$lib/stores/map.svelte';
	import { setupUrlSync } from '$lib/stores/url-sync.svelte';

	let { children }: { children: Snippet } = $props();

	const store = getMapStore();

	// Mirror the About modal and active filter into the URL query string
	// so any state is shareable / deep-linkable, and the browser's Back
	// button closes an open About modal.
	setupUrlSync();

	// Register the PWA service worker on the client. With `registerType:
	// 'autoUpdate'` (vite.config.ts) a newly deployed version is fetched and
	// applied silently on the next visit — no update toast, no install prompt.
	// Dynamically imported so the virtual module is only pulled in the browser
	// bundle, never during prerendering.
	onMount(() => {
		let registrationTimer: ReturnType<typeof setTimeout> | undefined;
		const register = () => {
			// PWA installation downloads the app shell in the background. Give the
			// first gallery render priority so those requests do not compete with
			// visible artwork images on a visitor's first load.
			registrationTimer = setTimeout(() => {
				void import('virtual:pwa-register').then(({ registerSW }) => registerSW());
			}, 3000);
		};

		if (document.readyState === 'complete') register();
		else window.addEventListener('load', register, { once: true });

		return () => {
			window.removeEventListener('load', register);
			if (registrationTimer) clearTimeout(registrationTimer);
		};
	});

	let mapView: MapView | undefined = $state();
	type MapViewConstructor = (typeof import('$lib/components/MapView.svelte'))['default'];
	let MapViewComponent: MapViewConstructor | undefined = $state();
	let mapImportStarted = false;
	const onCollectionRoute = $derived(page.url.pathname.replace(/\/$/, '').endsWith('/collection'));
	// A direct collection visit should not pay for WebGL, basemap data, or the
	// MapLibre bundle. Once the map has been requested, keep it mounted while
	// switching views so the visitor does not repeatedly rebuild its context.
	// Use the pathname rather than route.id: the latter can be transient while
	// a prerendered deep link hydrates and would permanently trip this latch.
	let mapActivated = $state(!page.url.pathname.replace(/\/$/, '').endsWith('/collection'));
	$effect(() => {
		if (!onCollectionRoute) {
			mapActivated = true;
			if (!mapImportStarted) {
				mapImportStarted = true;
				void import('$lib/components/MapView.svelte').then(({ default: component }) => {
					MapViewComponent = component;
				});
			}
		}
	});

	// Reset goes back to the canonical home URL and recenters the map.
	function resetView() {
		store.activeFilter = 'all';
		store.selectedArtwork = null;
		store.selectedResidence = null;
		mapView?.resetView();
		goto(resolve('/'));
	}
</script>

<svelte:head>
	<link rel="icon" href={logo} type="image/png" />
	<link rel="preload" href={cormorantLatin} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={outfitLatin} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			if (store.missingOpen) {
				store.missingOpen = false;
			} else if (store.aboutOpen) {
				store.aboutOpen = false;
			} else if (store.browseOpen) {
				store.browseOpen = false;
			} else if (store.selectedArtwork || store.selectedResidence) {
				goto(resolve('/'));
			}
		}
	}}
/>

<!-- First tab stop on the page. The map is a canvas with no focusable markers,
     so without this a keyboard user tabs through the chrome and reaches nothing
     they can actually read. -->
<!-- preventDefault: the panel is `inert` until it opens, so a plain hash jump
     would target an element the caret can't enter. Opening it moves focus
     there instead (see CollectionPanel). The href stays for discoverability
     and for the no-JS case. -->
<a
	class="skip-link"
	href="#collection"
	onclick={(e) => {
		e.preventDefault();
		store.browseOpen = true;
	}}
>
	Skip to the collection list
</a>

{@render children()}

<Header onreset={resetView} />
<FilterBar />
<main>
	{#if mapActivated && MapViewComponent}
		<MapViewComponent bind:this={mapView} showStatus={!onCollectionRoute} />
	{/if}
	<CollectionPanel />
</main>
<Sidebar />
<!-- The legend explains marker shapes, so it only belongs over the map. -->
{#if !onCollectionRoute}
	<Legend />
{/if}
<Footer />
<AboutModal />
<MissingWorksModal />
