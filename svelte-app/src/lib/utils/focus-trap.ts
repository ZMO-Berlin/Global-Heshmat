/**
 * Svelte action giving a dialog-like element the standard modal focus
 * behaviour: move focus inside when it appears, keep Tab / Shift+Tab cycling
 * within it, and hand focus back to the previously focused element when it
 * goes away. Apply with `use:trapFocus` on the dialog container (which should
 * also carry `role="dialog"` and `aria-modal="true"`).
 */

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
	'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapFocus(node: HTMLElement) {
	const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

	// Initial focus: the first focusable child (dialogs here always have at
	// least a close button), or the container itself as a fallback.
	const first = node.querySelector<HTMLElement>(FOCUSABLE);
	if (first) {
		first.focus();
	} else {
		node.setAttribute('tabindex', '-1');
		node.focus();
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key !== 'Tab') return;
		const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
		if (focusable.length === 0) return;
		const firstEl = focusable[0];
		const lastEl = focusable[focusable.length - 1];
		const active = document.activeElement;

		if (e.shiftKey && (active === firstEl || active === node)) {
			e.preventDefault();
			lastEl.focus();
		} else if (!e.shiftKey && active === lastEl) {
			e.preventDefault();
			firstEl.focus();
		}
	}

	node.addEventListener('keydown', onKeydown);

	return {
		destroy() {
			node.removeEventListener('keydown', onKeydown);
			previous?.focus();
		}
	};
}
