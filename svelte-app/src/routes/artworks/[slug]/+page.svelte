<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { getMapStore } from '$lib/stores/map.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const store = getMapStore();

	// The route IS the source of truth for which artwork is open. Reflect
	// the URL into the shared store so the layout-level Sidebar opens.
	$effect(() => {
		store.selectedArtwork = data.artwork;
	});
</script>

<Seo artwork={data.artwork} />
