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
		font-family: var(--font-display);
		font-style: italic;
		font-weight: var(--weight-regular);
		font-size: 0.7em;
		letter-spacing: var(--tracking-wide);
		color: rgb(var(--color-header-text-rgb) / 0.65);
		margin-left: var(--space-1);
	}
	@media (max-width: 768px) {
		.header-subtitle {
			display: none;
		}
	}
</style>
