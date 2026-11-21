<script lang="ts">
	import { getCalendarState, getDaysInMonth, getStartDayOfMonth } from '$lib';
	import CalendarGrid from './CalendarGrid.svelte';

	const cal = getCalendarState();

	let daysInMonth = $derived(getDaysInMonth(cal.viewDate.getFullYear(), cal.viewDate.getMonth()));
	let startDay = $derived(getStartDayOfMonth(cal.viewDate.getFullYear(), cal.viewDate.getMonth()));
</script>

<div
	class="flex-1 min-h-0 bg-bg text-text font-sans flex flex-col"
	role="region"
	aria-label="Calendar"
>
	<!-- The month swipe is attached to the whole calendar page so it works over
	     the header too; this wrapper is the element it slides. -->
	<div data-month-slide class="flex-1 min-h-0 flex flex-col will-change-transform">
		<CalendarGrid {startDay} {daysInMonth} />
	</div>
</div>
