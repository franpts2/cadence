<script lang="ts">
	import { getCalendarState, getDaysInMonth, getStartDayOfMonth } from '$lib';
	import CalendarGrid from './CalendarGrid.svelte';

	const cal = getCalendarState();

	let daysInMonth = $derived(getDaysInMonth(cal.viewDate.getFullYear(), cal.viewDate.getMonth()));
	let startDay = $derived(getStartDayOfMonth(cal.viewDate.getFullYear(), cal.viewDate.getMonth()));

	// Horizontal swipe to change month — the gesture phone users expect from a
	// calendar. Recorded at capture time on touchend so a long-press drag (which
	// clears `draggingSong` in its own handler) can never be mistaken for a swipe.
	let touchStart: { x: number; y: number } | null = null;
	const SWIPE_MIN = 56;

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length !== 1) {
			touchStart = null;
			return;
		}
		touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}

	function handleTouchEndCapture(e: TouchEvent) {
		const start = touchStart;
		touchStart = null;
		if (!start || cal.draggingSong) return;

		const touch = e.changedTouches[0];
		const dx = touch.clientX - start.x;
		const dy = touch.clientY - start.y;

		// Must be clearly horizontal, so vertical scrolling never changes month.
		if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy) * 2) return;

		if (dx < 0) cal.nextMonth();
		else cal.prevMonth();
	}
</script>

<div
	class="flex-1 min-h-0 bg-bg text-text font-sans flex flex-col"
	role="region"
	aria-label="Calendar"
	ontouchstart={handleTouchStart}
	ontouchendcapture={handleTouchEndCapture}
	ontouchcancel={() => (touchStart = null)}
>
	<CalendarGrid
		{startDay}
		{daysInMonth}
	/>
</div>
