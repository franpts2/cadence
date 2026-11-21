import { prefersReducedMotion } from '../utils/transitions';

export interface MonthSwipeParams {
	onPrev: () => void;
	onNext: () => void;
	/** The element that should follow the finger (usually the month grid). */
	target: () => HTMLElement | null;
	/** A running song drag owns the gesture and blocks month swiping. */
	isBlocked?: () => boolean;
	/** Pixels from the left edge that belong to iOS Safari's back gesture. */
	edgeGuard?: number;
}

const SWIPE_LOCK = 8;
const DISTANCE_RATIO = 0.22;
const FLING_VELOCITY = 400;
// Buttons are deliberately allowed: songs and the empty-day "add" target are
// buttons, and the swipe surface would shrink to nothing if they were excluded.
// A horizontal drag suppresses the click, so a swipe never turns into a tap.
const INTERACTIVE = 'a, input, textarea, select, [data-no-swipe]';

/**
 * Tracks a horizontal swipe 1:1 and slides the month in from the gesture's
 * direction. The action sits on the whole calendar surface (header included)
 * so the swipe works wherever the user's thumb happens to land.
 */
export function monthSwipe(node: HTMLElement, params: MonthSwipeParams) {
	let opts = params;

	let tracking = false;
	let axis: 'x' | 'y' | null = null;
	let pointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let lastX = 0;
	let lastTime = 0;
	let velocity = 0;
	let dragX = 0;
	let moved = false;
	let animating = false;
	let suppressClick = false;
	let wheelAccum = 0;
	let wheelResetTimer: ReturnType<typeof setTimeout> | null = null;
	let wheelLockedUntil = 0;

	function wait(ms: number) {
		return new Promise<void>((resolve) => setTimeout(resolve, ms));
	}

	function setSlide(x: number, animate: boolean) {
		const el = opts.target();
		if (!el) return;
		el.style.transition = animate
			? `transform ${x === 0 ? 220 : 200}ms cubic-bezier(0.23, 1, 0.32, 1)`
			: 'none';
		el.style.transform = `translate3d(${x}px, 0, 0)`;
		dragX = x;
	}

	function cancelTracking() {
		if (pointerId !== null) {
			try {
				node.releasePointerCapture(pointerId);
			} catch {
				// Pointer already gone.
			}
		}
		pointerId = null;
		tracking = false;
		axis = null;
		moved = false;
	}

	function handlePointerDown(e: PointerEvent) {
		// Mouse keeps its native drag-and-drop and text selection.
		if (e.pointerType === 'mouse' || animating || e.button !== 0) return;
		if (opts.isBlocked?.()) return;
		if ((e.target as Element).closest(INTERACTIVE)) return;

		if (tracking && pointerId !== e.pointerId) cancelTracking();

		tracking = true;
		axis = null;
		moved = false;
		suppressClick = false;
		pointerId = e.pointerId;
		startX = e.clientX;
		startY = e.clientY;
		lastX = e.clientX;
		lastTime = performance.now();
		velocity = 0;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!tracking || e.pointerId !== pointerId) return;

		if (opts.isBlocked?.()) {
			cancelTracking();
			return;
		}

		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		if (!axis) {
			if (Math.abs(dx) < SWIPE_LOCK && Math.abs(dy) < SWIPE_LOCK) return;

			// Leave iOS Safari's edge-back gesture alone.
			if (startX < (opts.edgeGuard ?? 20) && dx > 0) {
				cancelTracking();
				return;
			}

			if (Math.abs(dx) > Math.abs(dy) * 1.15) {
				axis = 'x';
				try {
					node.setPointerCapture(e.pointerId);
				} catch {
					// Capture is an optimisation, not a requirement.
				}
			} else {
				// Vertical intent: let native scrolling take over.
				cancelTracking();
				return;
			}
		}

		if (axis !== 'x') return;
		if (e.cancelable) e.preventDefault();

		moved = true;
		setSlide(dx, false);

		const now = performance.now();
		const dt = now - lastTime;
		if (dt > 0) velocity = ((e.clientX - lastX) / dt) * 1000;
		lastX = e.clientX;
		lastTime = now;
	}

	function handlePointerUp(e: PointerEvent) {
		if (!tracking || e.pointerId !== pointerId) return;

		const wasHorizontal = axis === 'x' && moved;
		cancelTracking();

		if (!wasHorizontal) return;

		if (performance.now() - lastTime > 80) velocity = 0;

		// Swiping must never also tap the surface underneath.
		suppressClick = true;

		const width = node.clientWidth || window.innerWidth;
		const passed = Math.abs(dragX) > width * DISTANCE_RATIO || Math.abs(velocity) > FLING_VELOCITY;

		if (!passed) {
			void snapBack();
			return;
		}

		void changeMonth(dragX < 0 ? 'next' : 'prev');
	}

	function handlePointerCancel() {
		if (!tracking) return;
		const wasHorizontal = axis === 'x' && moved;
		cancelTracking();
		if (wasHorizontal) void snapBack();
	}

	async function snapBack() {
		animating = true;
		setSlide(0, !prefersReducedMotion());
		await wait(prefersReducedMotion() ? 0 : 220);
		animating = false;
	}

	async function changeMonth(direction: 'prev' | 'next') {
		animating = true;
		const width = node.clientWidth || window.innerWidth;

		if (prefersReducedMotion()) {
			if (direction === 'next') opts.onNext();
			else opts.onPrev();
			setSlide(0, false);
			animating = false;
			return;
		}

		// Slide the current month out, swap the data, then enter from the
		// opposite edge — so the new month arrives from the swipe direction.
		const outX = direction === 'next' ? -width : width;
		const inX = -outX;

		setSlide(outX, true);
		await wait(200);

		if (direction === 'next') opts.onNext();
		else opts.onPrev();

		setSlide(inX, false);
		void opts.target()?.offsetWidth;
		setSlide(0, true);
		await wait(220);

		animating = false;
	}

	// Trackpads send horizontal wheel deltas rather than pointer drags. Treat a
	// deliberate horizontal scroll as a month change, with enough accumulation
	// that a diagonal vertical scroll never triggers it.
	function handleWheel(e: WheelEvent) {
		if (e.ctrlKey || animating || opts.isBlocked?.()) return;
		if (Math.abs(e.deltaX) < 4 || Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.2) return;

		const now = performance.now();
		if (now < wheelLockedUntil) return;

		e.preventDefault();
		wheelAccum += e.deltaX;

		if (wheelResetTimer) clearTimeout(wheelResetTimer);
		wheelResetTimer = setTimeout(() => (wheelAccum = 0), 200);

		if (Math.abs(wheelAccum) < 48) return;

		const direction = wheelAccum > 0 ? 'next' : 'prev';
		wheelAccum = 0;
		wheelLockedUntil = now + 500;
		void changeMonth(direction);
	}

	function handleClickCapture(e: MouseEvent) {
		if (!suppressClick) return;
		e.preventDefault();
		e.stopPropagation();
		suppressClick = false;
	}

	const previousTouchAction = node.style.touchAction;
	node.style.touchAction = 'pan-y';

	node.addEventListener('pointerdown', handlePointerDown);
	node.addEventListener('pointermove', handlePointerMove);
	node.addEventListener('pointerup', handlePointerUp);
	node.addEventListener('pointercancel', handlePointerCancel);
	node.addEventListener('click', handleClickCapture, true);
	node.addEventListener('wheel', handleWheel, { passive: false });

	return {
		update(next: MonthSwipeParams) {
			opts = next;
		},
		destroy() {
			node.removeEventListener('pointerdown', handlePointerDown);
			node.removeEventListener('pointermove', handlePointerMove);
			node.removeEventListener('pointerup', handlePointerUp);
			node.removeEventListener('pointercancel', handlePointerCancel);
			node.removeEventListener('click', handleClickCapture, true);
			node.removeEventListener('wheel', handleWheel);
			node.style.touchAction = previousTouchAction;
			if (wheelResetTimer) clearTimeout(wheelResetTimer);
		}
	};
}
