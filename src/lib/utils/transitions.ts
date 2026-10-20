import { cubicOut, quadIn } from 'svelte/easing';

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

/** Dialogs are bottom sheets below Tailwind's `sm` breakpoint. */
function isPhone(): boolean {
	return typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;
}

interface SheetParams {
	duration?: number;
}

/**
 * Dialog enter/exit: from `sm` up it is a centred dialog (fade + a short rise
 * and scale); on phones it is a bottom sheet that slides its own height up from
 * the bottom edge. Moving by 100% of the panel height — rather than a token
 * 20px — is what makes the sheet read as a drawer.
 *
 * The curves differ on purpose: the sheet decelerates into place on enter and
 * accelerates away on exit. Reduced motion keeps the opacity cross-fade only.
 */
export function sheetIn(_node: HTMLElement, { duration }: SheetParams = {}) {
	const reduce = prefersReducedMotion();
	const phone = isPhone();
	return {
		duration: duration ?? (phone ? 360 : 200),
		easing: cubicOut,
		css: (t: number, u: number) =>
			reduce
				? `opacity: ${t}`
				: phone
					? `transform: translateY(${u * 100}%)`
					: `opacity: ${t}; transform: translateY(${u * 12}px) scale(${1 - 0.03 * u})`
	};
}

export function sheetOut(_node: HTMLElement, { duration }: SheetParams = {}) {
	const reduce = prefersReducedMotion();
	const phone = isPhone();
	return {
		duration: duration ?? (phone ? 280 : 200),
		easing: quadIn,
		css: (t: number, u: number) =>
			reduce
				? `opacity: ${t}`
				: phone
					? `transform: translateY(${u * 100}%)`
					: `opacity: ${t}; transform: translateY(${u * 12}px) scale(${1 - 0.03 * u})`
	};
}
