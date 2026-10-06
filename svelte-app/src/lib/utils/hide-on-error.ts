/**
 * A Svelte action that hides the element wrapping an <img> whose source fails
 * to load — used for the lightbox's thumbnail buttons, where an empty button
 * would otherwise remain in the strip as a clickable gap. (Album images show
 * MediaImage's "Image unavailable" state instead.)
 *
 * It listens for `load` as well as `error` and restores visibility on success,
 * so an element hidden by one bad image comes back if its `src` is replaced.
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

/** Hide the <img>'s parent (e.g. a thumbnail button) when loading fails. */
export function hideParentOnError(node: HTMLImageElement) {
	return watch(node, () => node.parentElement);
}
