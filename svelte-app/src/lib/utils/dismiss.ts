interface Popover {
	isOpen: () => boolean;
	close: () => void;
	/** Elements a click may land in without closing the popover (its panel and its toggle). */
	inside: () => (Node | null | undefined)[];
	/** Receives focus after Escape closes the popover. */
	returnFocus?: () => HTMLElement | null | undefined;
}

/**
 * Window handlers that close a popover on Escape or on a click outside it.
 * Bind `onkeydown` as `onkeydowncapture` on `<svelte:window>`: in the capture
 * phase Escape closes the popover and stops there, before the layout's own
 * Escape handling (closing the entry or the browse panel) sees it.
 */
export function popoverDismissal({ isOpen, close, inside, returnFocus }: Popover) {
	return {
		onkeydown(event: KeyboardEvent) {
			if (event.key !== 'Escape' || !isOpen()) return;
			event.stopPropagation();
			close();
			returnFocus?.()?.focus();
		},
		onclick(event: MouseEvent) {
			const target = event.target as Node;
			if (isOpen() && !inside().some((element) => element?.contains(target))) close();
		}
	};
}
