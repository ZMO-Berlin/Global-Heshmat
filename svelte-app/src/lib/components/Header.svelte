<script lang="ts">
	import { getMapStore } from '$lib/stores/map.svelte';

	let { onreset }: { onreset: () => void } = $props();
	const store = getMapStore();
</script>

<header class="header">
	<h1>
		<span>Global Heshmat</span>
		<span class="header-subtitle">&mdash; Following Hassan Heshmat around the world</span>
	</h1>
	<div class="header-right">
		<button class="header-btn" onclick={onreset}>World View</button>
		<button class="header-btn" onclick={() => (store.aboutOpen = true)}>About</button>
	</div>
</header>

<style>
	.header-subtitle {
		font-weight: 400;
		opacity: 0.7;
		font-size: 0.85em;
	}
</style>
