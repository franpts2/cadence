<script lang="ts">
	import Calendar from '$lib/Calendar.svelte';
	import Header from '$lib/components/Header.svelte';
	import SongSearchModal from '$lib/components/SongSearchModal.svelte';
	import { page } from '$app/state';
	import { CalendarState } from '$lib/calendar.svelte';

	const session = $derived(page.data.session);
	const cal = new CalendarState();

	$effect(() => {
		if (session?.user) {
			cal.loadSongs();
		} else {
			cal.songsPerDay = {};
		}
	});
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
			getSongsForDate={(day) => cal.getSongsForDay(day)}
			onAddSong={(day) => cal.startSearchForDay(day)}
			onDeleteSong={(day) => cal.removeSongFromDate(day)}
		/>
	</main>
</div>

<SongSearchModal 
	isOpen={cal.isSearchOpen} 
	onClose={() => cal.closeSearch()}
	onSelect={(song) => {
		if (cal.searchingForDate) {
			cal.addSongToDate(cal.searchingForDate, song);
		}
	}}
/>
