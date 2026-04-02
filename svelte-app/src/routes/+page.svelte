<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import MapView from '$lib/components/MapView.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Legend from '$lib/components/Legend.svelte';
	import AboutModal from '$lib/components/AboutModal.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { getMapStore } from '$lib/stores/map.svelte';
	import { initUrlSync } from '$lib/stores/url.svelte';

	const store = getMapStore();
	let mapView: MapView;

	// Sync ?artwork=<id> query param with selected artwork
	initUrlSync();

	function resetView() {
		store.selectedArtwork = null;
		store.activeFilter = 'all';
		mapView.resetView();
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			if (store.aboutOpen) {
				store.aboutOpen = false;
			} else if (store.selectedArtwork) {
				store.selectedArtwork = null;
			}
		}
	}}
/>

<Seo />
<Header onreset={resetView} />
<FilterBar />
<MapView bind:this={mapView} />
<Sidebar />
<Legend />
<AboutModal />
