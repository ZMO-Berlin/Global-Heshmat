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
		<div
			class="modal-card"
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
			use:trapFocus
		>
			<div class="modal-header">
				<h2 id={titleId}>{title}</h2>
				<button class="sidebar-close" onclick={onclose} aria-label="Close">
					<X size={20} strokeWidth={2.25} />
				</button>
			</div>
			<div class="modal-body">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
