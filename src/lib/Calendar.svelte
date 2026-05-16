<script lang="ts">
	import type { Song } from './calendar.svelte';
	import CalendarGrid from './components/calendar/CalendarGrid.svelte';

	let { viewDate, selectedDate, selectDate, getSongsForDate, onAddSong } = $props<{
		viewDate: Date;
		selectedDate: Date;
		selectDate: (day: number) => void;
		getSongsForDate: (day: number) => Song[];
		onAddSong: (day: number) => void;
	}>();

	const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

	function getDaysInMonth(year: number, month: number) {
		return new Date(year, month + 1, 0).getDate();
	}

	function getStartDayOfMonth(year: number, month: number) {
		return new Date(year, month, 1).getDay();
	}

	let daysInMonth = $derived(getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()));
	let startDay = $derived(getStartDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()));

	function isToday(day: number) {
		const today = new Date();
		return today.getDate() === day &&
			today.getMonth() === viewDate.getMonth() &&
			today.getFullYear() === viewDate.getFullYear();
	}

	function isSelected(day: number) {
		return selectedDate.getDate() === day &&
			selectedDate.getMonth() === viewDate.getMonth() &&
			selectedDate.getFullYear() === viewDate.getFullYear();
	}
</script>

<div class="flex-1 bg-zinc-950 text-zinc-100 font-sans overflow-hidden flex flex-col">
	<CalendarGrid
		{daysOfWeek}
		{startDay}
		{daysInMonth}
		{isToday}
		{isSelected}
		getSongsForDate={(day) => getSongsForDate(day)}
		onSelectDate={selectDate}
		onAddSong={(day) => onAddSong(day)}
	/>
</div>
