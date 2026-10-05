<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import EntryDetail from '$lib/components/EntryDetail.svelte';
	import { getBrowseStore } from '$lib/stores/browse.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const store = getBrowseStore();
</script>

<Seo residence={data.residence} />
<EntryDetail galleryView={store.view !== 'map'} />
