<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Seo from '$lib/components/Seo.svelte';
	import { artworks } from '$lib/data/artworks';

	// Backwards compatibility: redirect legacy /?artwork=<id> deep links to
	// the new /artworks/<slug>/ canonical URLs.
	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const idParam = params.get('artwork');
		if (idParam === null) return;

		const id = Number(idParam);
		if (Number.isNaN(id)) return;

		const match = artworks.find((a) => a.id === id);
		if (match) {
			goto(resolve('/artworks/[slug]', { slug: match.slug }), { replaceState: true });
		}
	});
</script>

<Seo />
