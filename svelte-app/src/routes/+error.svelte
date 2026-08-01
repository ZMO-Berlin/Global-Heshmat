<script lang="ts">
	import { Compass } from '@lucide/svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getMapStore } from '$lib/stores/map.svelte';

	/**
	 * Rendered in place of the page content when a route errors — in practice
	 * almost always a 404 from adapter-static's 404.html fallback, e.g. a stale
	 * link to an artwork whose slug has since changed.
	 *
	 * Without this the fallback rendered the bare app shell: a visitor at a dead
	 * URL saw the map with no indication anything had gone wrong.
	 */

	const store = getMapStore();

	const isNotFound = $derived(page.status === 404);
	const heading = $derived(isNotFound ? 'That page has moved or never existed' : 'Something broke');
</script>

<svelte:head>
	<title>{page.status} — Global Heshmat</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="error-screen">
	<div class="error-card" role="alert">
		<Compass size={36} strokeWidth={1.5} aria-hidden="true" />
		<p class="error-status">Error {page.status}</p>
		<h1>{heading}</h1>
		<p class="error-body">
			{#if isNotFound}
				The address <code>{page.url.pathname}</code> doesn't match any artwork or place of residence in
				the collection.
			{:else}
				{page.error?.message ?? 'An unexpected error occurred.'}
			{/if}
		</p>
		<div class="error-actions">
			<a class="error-btn error-btn-primary" href={resolve('/')}>Back to the map</a>
			<button class="error-btn" onclick={() => (store.browseOpen = true)}>
				Browse the collection
			</button>
		</div>
	</div>
</div>

<style>
	/* Above the map and its loading veil (both at --z-legend) and above the
	   sidebar, but below modals — the message must not be obscured, while the
	   header, filter bar and footer stay usable so the visitor can navigate
	   straight out. */
	.error-screen {
		position: fixed;
		top: calc(var(--header-height) + var(--filter-height));
		bottom: var(--footer-height);
		left: 0;
		right: 0;
		z-index: calc(var(--z-modal) - 1);
		display: grid;
		place-items: center;
		padding: var(--space-6);
		background: rgb(var(--color-header-bg-rgb) / 0.4);
		backdrop-filter: blur(var(--scrim-blur));
	}
	.error-card {
		max-width: 30rem;
		text-align: center;
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-lg);
		padding: var(--space-8) var(--space-7);
		color: var(--color-text-muted);
	}
	.error-status {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-widest);
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin-top: var(--space-3);
	}
	.error-card h1 {
		font-family: var(--font-display);
		font-size: var(--text-3xl);
		font-weight: var(--weight-semibold);
		line-height: var(--leading-tight);
		color: var(--color-ink);
		margin: var(--space-2) 0 var(--space-3);
	}
	.error-body {
		font-size: var(--text-md);
		line-height: var(--leading-relaxed);
		color: var(--color-text-secondary);
	}
	.error-body code {
		font-size: 0.9em;
		background: var(--color-surface-warm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xs);
		padding: 1px 5px;
		word-break: break-all;
	}
	.error-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2-5);
		justify-content: center;
		margin-top: var(--space-6);
	}
	.error-btn {
		min-height: 44px;
		font-family: var(--font-body);
		font-size: var(--text-base);
		font-weight: var(--weight-medium);
		padding: var(--space-2-5) var(--space-5);
		border-radius: var(--radius-pill);
		border: 1px solid var(--color-border);
		background: var(--color-surface);
		color: var(--color-ink);
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color var(--duration-base) var(--ease-out),
			border-color var(--duration-base) var(--ease-out),
			box-shadow var(--duration-base) var(--ease-out),
			color var(--duration-base) var(--ease-out);
	}
	.error-btn:hover {
		border-color: var(--color-text-muted);
		box-shadow: var(--shadow-sm);
	}
	.error-btn-primary {
		background: var(--color-primary-text);
		border-color: var(--color-primary-text);
		color: var(--color-on-dark);
	}
	.error-btn-primary:hover {
		opacity: 0.9;
	}
</style>
