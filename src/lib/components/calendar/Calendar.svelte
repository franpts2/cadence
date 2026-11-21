<script lang="ts">
	import { getCalendarState, getDaysInMonth, getStartDayOfMonth, prefersReducedMotion } from '$lib';
	import CalendarGrid from './CalendarGrid.svelte';

	const cal = getCalendarState();

	let daysInMonth = $derived(getDaysInMonth(cal.viewDate.getFullYear(), cal.viewDate.getMonth()));
	let startDay = $derived(getStartDayOfMonth(cal.viewDate.getFullYear(), cal.viewDate.getMonth()));

	// Horizontal swipe to change month — the gesture phone users expect from a
	// calendar. Tracking drives the grid 1:1 with the finger; the release either
	// snaps back or slides the next month in from the direction of the swipe.
	const SWIPE_LOCK = 8;
	const DISTANCE_RATIO = 0.22;
	const FLING_VELOCITY = 400;
	const EDGE_GUARD = 20;

	let surfaceEl = $state<HTMLElement>();
	let slideEl = $state<HTMLElement>();

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

	function wait(ms: number) {
		return new Promise<void>((resolve) => setTimeout(resolve, ms));
	}

	function setSlide(x: number, animate: boolean) {
		if (!slideEl) return;
		slideEl.style.transition = animate
			? `transform ${x === 0 ? 220 : 200}ms cubic-bezier(0.23, 1, 0.32, 1)`
			: 'none';
		slideEl.style.transform = `translate3d(${x}px, 0, 0)`;
		dragX = x;
	}

	function cancelTracking() {
		if (pointerId !== null && surfaceEl) {
			try {
				surfaceEl.releasePointerCapture(pointerId);
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
		if (cal.draggingSong) return;

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

		// A long-press drag owns the gesture now.
		if (cal.draggingSong) {
			cancelTracking();
			return;
		}

		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		if (!axis) {
			if (Math.abs(dx) < SWIPE_LOCK && Math.abs(dy) < SWIPE_LOCK) return;

			// Leave iOS Safari's edge-back gesture alone.
			if (startX < EDGE_GUARD && dx > 0) {
				cancelTracking();
				return;
			}

			if (Math.abs(dx) > Math.abs(dy) * 1.15) {
				axis = 'x';
				try {
					surfaceEl?.setPointerCapture(e.pointerId);
				} catch {
					// Capture is an optimisation, not a requirement.
				}
			} else {
				// Vertical intent: let the native scroll take over.
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

		// A finger that stopped before lifting carries no velocity.
		if (performance.now() - lastTime > 80) velocity = 0;

		// Swiping must never also tap the day underneath, even on a snap-back.
		suppressClick = true;

		const width = surfaceEl?.clientWidth || window.innerWidth;
		const passed = Math.abs(dragX) > width * DISTANCE_RATIO || Math.abs(velocity) > FLING_VELOCITY;

		if (!passed) {
			snapBack();
			return;
		}

		void changeMonth(dragX < 0 ? 'next' : 'prev');
	}

	function handlePointerCancel() {
		if (!tracking) return;
		const wasHorizontal = axis === 'x' && moved;
		cancelTracking();
		if (wasHorizontal) snapBack();
	}

	async function snapBack() {
		animating = true;
		setSlide(0, !prefersReducedMotion());
		await wait(prefersReducedMotion() ? 0 : 220);
		animating = false;
	}

	async function changeMonth(direction: 'prev' | 'next') {
		animating = true;
		const width = surfaceEl?.clientWidth || window.innerWidth;

		if (prefersReducedMotion()) {
			if (direction === 'next') cal.nextMonth();
			else cal.prevMonth();
			setSlide(0, false);
			animating = false;
			return;
		}

		// Slide the current month out, swap the data, then enter from the
		// opposite edge — so the new month always arrives from the swipe direction.
		const outX = direction === 'next' ? -width : width;
		const inX = -outX;

		setSlide(outX, true);
		await wait(200);

		if (direction === 'next') cal.nextMonth();
		else cal.prevMonth();

		setSlide(inX, false);
		// Force a reflow so the next frame animates from the far edge.
		void slideEl?.offsetWidth;
		setSlide(0, true);
		await wait(220);

		animating = false;
	}

	function handleClickCapture(e: MouseEvent) {
		if (!suppressClick) return;
		e.preventDefault();
		e.stopPropagation();
		suppressClick = false;
	}
</script>

<div
	bind:this={surfaceEl}
	class="flex-1 min-h-0 bg-bg text-text font-sans flex flex-col touch-pan-y"
	role="region"
	aria-label="Calendar"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerCancel}
	onclickcapture={handleClickCapture}
>
	<div bind:this={slideEl} class="flex-1 min-h-0 flex flex-col will-change-transform">
		<CalendarGrid {startDay} {daysInMonth} />
	</div>
</div>
