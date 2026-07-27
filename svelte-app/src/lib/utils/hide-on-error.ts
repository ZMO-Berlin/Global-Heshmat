/**
 * Svelte actions that hide an <img> whose source fails to load, so a missing
 * derivative leaves clean empty space rather than a broken-image glyph.
 *
 * Both listen for `load` as well as `error` and restore visibility on success:
 * the gallery swaps `src` on a single long-lived <img> as the user navigates,
 * so an element hidden by one bad image must come back for the next good one.
 *
 * `hideOnError` hides the image itself — used where the surrounding frame
 * should stay (the gallery's fixed-aspect slot, the lightbox stage).
 * `hideParentOnError` hides the wrapping element instead — used for thumbnail
 * buttons, where an empty button would otherwise remain in the strip as a
 * clickable gap.
 */

function watch(node: HTMLImageElement, target: () => HTMLElement | null) {
	const show = () => {
		const el = target();
		if (el) el.style.display = '';
	};
	const hide = () => {
		const el = target();
		if (el) el.style.display = 'none';
	};

	// An image cached and already decoded before the action runs fires neither
	// event, so settle the initial state synchronously.
	if (node.complete && node.naturalWidth === 0) hide();

	node.addEventListener('load', show);
	node.addEventListener('error', hide);

	return {
		destroy() {
			node.removeEventListener('load', show);
			node.removeEventListener('error', hide);
		}
	};
}

/** Hide the <img> itself when its source fails to load. */
export function hideOnError(node: HTMLImageElement) {
	return watch(node, () => node);
}

/** Hide the <img>'s parent (e.g. a thumbnail button) when loading fails. */
export function hideParentOnError(node: HTMLImageElement) {
	return watch(node, () => node.parentElement);
}
