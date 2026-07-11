<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import logo from '$lib/assets/logo-zmo.png';
	import Header from '$lib/components/Header.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import AboutModal from '$lib/components/AboutModal.svelte';
	import MissingWorksModal from '$lib/components/MissingWorksModal.svelte';
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
		void import('virtual:pwa-register').then(({ registerSW }) => {
			registerSW({ immediate: true });
		});
	});

	let mapView: MapView | undefined = $state();

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
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			if (store.missingOpen) {
				store.missingOpen = false;
			} else if (store.aboutOpen) {
				store.aboutOpen = false;
			} else if (store.selectedArtwork || store.selectedResidence) {
				goto(resolve('/'));
			}
		}
	}}
/>

{@render children()}

<Header onreset={resetView} />
<FilterBar />
<MapView bind:this={mapView} />
<Sidebar />
<Legend />
<Footer />
<AboutModal />
<MissingWorksModal />
