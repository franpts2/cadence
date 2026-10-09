import { cubicOut } from 'svelte/easing';

/**
 * Shared Svelte transition helpers.
 *
 * Motion vocabulary (kept in sync with the `--ease-*` tokens in app.css):
 *   --ease-out: cubic-bezier(0.23, 1, 0.32, 1)
 *
 * Rules these helpers enforce:
 *   - animate transform + opacity only (GPU-friendly)
 *   - never start from scale(0); entrances scale from 0.9–0.97 + opacity
 *   - reduced motion keeps the opacity cross-fade and drops the transform
 */

export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

interface PopParams {
	duration?: number;
	/** Starting scale of the entrance. Must stay in 0.9–0.97. */
	start?: number;
	/** Vertical offset in px the element travels from/to. */
	y?: number;
}

/**
 * Enter/exit: opacity + optional translate + scale.
 * Use for popovers, tooltips, dropdowns, result lists and overlays.
 */
export function pop(
	_node: HTMLElement,
	{ duration = 150, start = 0.95, y = 0 }: PopParams = {}
) {
	const reduce = prefersReducedMotion();
	return {
		duration,
		easing: cubicOut,
		css: (t: number, u: number) =>
			reduce
				? `opacity: ${t}`
				: `opacity: ${t}; transform: translateY(${y * u}px) scale(${1 - (1 - start) * u})`
	};
}

interface ToastSlideParams {
	duration?: number;
}

/**
 * Toast enter/exit: slides by its own height from the top edge, so the enter
 * and exit paths match. Percentage translate adapts to any toast height.
 */
export function toastSlide(_node: HTMLElement, { duration = 400 }: ToastSlideParams = {}) {
	const reduce = prefersReducedMotion();
	return {
		duration,
		easing: cubicOut,
		css: (t: number, u: number) =>
			reduce ? `opacity: ${t}` : `opacity: ${t}; transform: translateY(-${u * 100}%)`
	};
}
