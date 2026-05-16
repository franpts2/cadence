<script lang="ts">
	import Calendar from '$lib/components/calendar/Calendar.svelte';
	import Header from '$lib/components/Header.svelte';
	import SongSearchModal from '$lib/components/SongSearchModal.svelte';
	import { page } from '$app/state';
	import { setCalendarState } from '$lib';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const session = $derived(page.data.session);
	
	// Initialize state with data from server
	const cal = setCalendarState();

	$effect(() => {
		if (data.songs) {
			cal.songsPerDay = cal.mapDbSongsToRecord(data.songs);
		}
	});

	$effect(() => {
		if (!session?.user) {
			cal.songsPerDay = {};
		}
	});
</script>

<div class="h-screen w-screen overflow-hidden bg-zinc-950 flex flex-col">
	<Header {session} />
	
	<main class="flex-1 overflow-hidden flex flex-col">
		<Calendar />
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
