<script lang="ts">
	import CalendarHeader from './components/calendar/CalendarHeader.svelte';
	import CalendarGrid from './components/calendar/CalendarGrid.svelte';

	let today = new Date();
	let viewDate = $state(new Date(today.getFullYear(), today.getMonth(), 1));
	let selectedDate = $state(today);

	const months = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

	function prevMonth() {
		viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
	}

	function nextMonth() {
		viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
	}

	function goToToday() {
		viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
		selectedDate = today;
	}

	function selectDate(day: number) {
		selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
	}

	function getDaysInMonth(year: number, month: number) {
		return new Date(year, month + 1, 0).getDate();
	}

	function getStartDayOfMonth(year: number, month: number) {
		return new Date(year, month, 1).getDay();
	}

	let daysInMonth = $derived(getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()));
	let startDay = $derived(getStartDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()));
	let monthLabel = $derived(months[viewDate.getMonth()]);
	let yearLabel = $derived(viewDate.getFullYear());

	function isToday(day: number) {
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

<div class="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans">
	<CalendarHeader
		{monthLabel}
		{yearLabel}
		onPrev={prevMonth}
		onNext={nextMonth}
		onToday={goToToday}
	/>

	<CalendarGrid
		{daysOfWeek}
		{startDay}
		{daysInMonth}
		{isToday}
		{isSelected}
		onSelectDate={selectDate}
	/>
</div>
