<script lang="ts">
	import { Globe, List } from '@lucide/svelte';
	import { getMapStore } from '$lib/stores/map.svelte';

	let { onreset }: { onreset: () => void } = $props();
	const store = getMapStore();
</script>

<header class="header">
	<h1>
		<!-- Non-breaking space: Svelte collapses ordinary whitespace around the
		     span boundary, which would render "GlobalHeshmat". Keeping it inside
		     the hidden span also removes it along with the word on narrow
		     viewports. -->
		<span><span class="wordmark-global">Global&nbsp;</span>Heshmat</span>
		<span class="header-subtitle">&mdash; Following Hassan Heshmat around the world</span>
	</h1>
	<div class="header-right">
		<!-- The collection list is the keyboard/screen-reader route into the
		     works, so it leads the button row. -->
		<button
			class="header-btn header-btn-icon"
			aria-label="Browse the collection"
			aria-expanded={store.browseOpen}
			aria-controls="collection"
			onclick={() => (store.browseOpen = !store.browseOpen)}
		>
			<List size={14} strokeWidth={2.5} aria-hidden="true" />
			<span class="browse-label">Browse</span>
		</button>
		<button class="header-btn header-btn-icon" aria-label="World view" onclick={onreset}>
			<Globe size={14} strokeWidth={2.5} aria-hidden="true" />
			<span class="reset-label">World View</span>
		</button>
		<button class="header-btn" onclick={() => (store.aboutOpen = true)}>About</button>
		<button class="header-btn header-btn-cta" onclick={() => (store.missingOpen = true)}>
			<span class="cta-full">Help us find missing works</span>
			<span class="cta-short">Missing works</span>
		</button>
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
	.header-btn-icon {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
	}
	@media (max-width: 768px) {
		.header-subtitle {
			display: none;
		}
		/* Icon-only on phones. Four controls plus the wordmark do not fit a
		   360-390px header as text; both read clearly as icons and keep their
		   accessible names via aria-label. */
		.browse-label,
		.reset-label {
			display: none;
		}
	}
	/* Below ~400px even the short labels overflow, so drop to the wordmark the
	   PWA manifest already uses as short_name. */
	@media (max-width: 400px) {
		.wordmark-global {
			display: none;
		}
	}
</style>
