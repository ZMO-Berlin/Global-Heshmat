<script lang="ts">
	import { X } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { trapFocus } from '$lib/utils/focus-trap';

	// Generic modal chrome: backdrop, centered card, title bar + close button,
	// and a scrollable body slot. Open state lives in the caller (e.g. the map
	// store) so it stays URL-syncable; this component is purely presentational.
	let {
		open,
		title,
		onclose,
		children
	}: {
		open: boolean;
		title: string;
		onclose: () => void;
		children: Snippet;
	} = $props();

	// Ties the dialog to its visible title for screen readers.
	const titleId = $props.id();

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}
</script>

{#if open}
	<!-- Backdrop click-to-close is a pointer convenience; the keyboard path is
	     the close button (focused on open) and the global Escape handler. -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={handleOverlayClick}>
		<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby={titleId} use:trapFocus>
			<div class="modal-header">
				<h2 id={titleId}>{title}</h2>
				<button class="btn-close" onclick={onclose} aria-label="Close">
					<X size={20} strokeWidth={2.25} />
				</button>
			</div>
			<div class="modal-body">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Shared modal chrome. The body rules are :global() because the content is
	   a snippet, compiled in the caller's scope (AboutModal / MissingWorksModal)
	   rather than this component's. */
	/* ═══════════════════════════════════════════
	   Modal (shared chrome: About, Missing works, …)
	   ═══════════════════════════════════════════ */
	.modal-overlay {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal);
		background: var(--scrim-modal);
		backdrop-filter: blur(var(--scrim-blur));
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn var(--duration-slow) var(--ease-out);
	}

	.modal-card {
		background: var(--color-surface);
		max-width: 700px;
		width: 92%;
		max-height: 82vh;
		border-radius: var(--radius-lg);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-lg);
		animation: modalSlideIn var(--duration-slower) var(--ease-out);
	}

	.modal-header {
		padding: var(--space-7) var(--space-8) var(--space-5);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.modal-header h2 {
		font-family: var(--font-display);
		font-size: var(--text-4xl);
		font-weight: var(--weight-semibold);
		color: var(--color-ink);
		line-height: var(--leading-tight);
	}

	.modal-body {
		padding: var(--space-7) var(--space-8);
		overflow-y: auto;
		font-size: var(--text-lg);
		line-height: var(--leading-loose);
		color: var(--color-text-secondary);
		scrollbar-width: thin;
		scrollbar-color: var(--color-border) transparent;
	}

	.modal-body :global(p) {
		margin-bottom: var(--space-4);
		max-width: var(--prose-width); /* keep the measure readable on wide modals */
	}

	.modal-body :global(a) {
		color: var(--color-primary-text);
		text-decoration-color: rgb(var(--color-primary-rgb) / 0.3);
		text-underline-offset: 2px;
		transition: text-decoration-color var(--duration-fast) var(--ease-out);
	}

	.modal-body :global(a:hover) {
		text-decoration-color: var(--color-primary-text);
	}

	.modal-body :global(.impressum) {
		margin-top: var(--space-7);
		padding-top: var(--space-5-5);
		border-top: 1px solid var(--color-border);
		font-size: var(--text-base);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
	}

	/* Editorial section heading: serif h3 with a short accent rule below,
	   echoing the sidebar h2 treatment so the modal feels like the same artefact. */
	.modal-body :global(h3) {
		font-family: var(--font-display);
		color: var(--color-ink);
		margin: var(--space-6) 0 var(--space-3-5);
		font-size: var(--text-xl);
		font-weight: var(--weight-semibold);
		line-height: var(--leading-tight);
	}

	.modal-body :global(h3::after) {
		content: '';
		display: block;
		width: 28px;
		height: 2px;
		background: var(--color-accent);
		margin-top: var(--space-1-5);
		border-radius: 1px;
	}

	.modal-body :global(.videos) {
		margin-top: var(--space-3);
	}

	.modal-body :global(.videos a) {
		display: block;
		margin: var(--space-2) 0;
		padding: var(--space-2-5) var(--space-4);
		background: var(--color-surface-warm);
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		text-decoration: none;
		font-size: var(--text-base);
		font-weight: var(--weight-medium);
		transition: all var(--duration-base) var(--ease-out);
	}

	.modal-body :global(.videos a:hover) {
		background: var(--color-accent-light);
		border-color: var(--color-accent);
		color: var(--color-accent-text);
	}
</style>
