<script lang="ts">
	import Calendar from '$lib/Calendar.svelte';
	import Header from '$lib/components/Header.svelte';
	import { page } from '$app/state';
	import { CalendarState } from '$lib/calendar.svelte';

	const session = $derived(page.data.session);
	const cal = new CalendarState();
</script>

<div class="h-screen w-screen overflow-hidden bg-zinc-950 flex flex-col">
	<Header
		monthLabel={cal.monthLabel}
		yearLabel={cal.yearLabel}
		onPrev={cal.prevMonth}
		onNext={cal.nextMonth}
		onToday={cal.goToToday}
		{session}
	/>
	
	<main class="flex-1 overflow-hidden flex flex-col">
		<Calendar 
			viewDate={cal.viewDate} 
			selectedDate={cal.selectedDate} 
			selectDate={cal.selectDate} 
		/>
	</main>
</div>
