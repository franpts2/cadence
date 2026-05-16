<script lang="ts">
	import { getCalendarState } from '$lib/state/calendar-state.svelte';
	import { getDaysInMonth, getStartDayOfMonth } from '$lib/utils/date';
	import CalendarGrid from './CalendarGrid.svelte';

	const cal = getCalendarState();

	let daysInMonth = $derived(getDaysInMonth(cal.viewDate.getFullYear(), cal.viewDate.getMonth()));
	let startDay = $derived(getStartDayOfMonth(cal.viewDate.getFullYear(), cal.viewDate.getMonth()));
</script>

<div class="flex-1 bg-zinc-950 text-zinc-100 font-sans overflow-hidden flex flex-col">
	<CalendarGrid
		{startDay}
		{daysInMonth}
	/>
</div>
