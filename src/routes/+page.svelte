<script lang="ts">
	import Calendar from '$lib/components/calendar/Calendar.svelte';
	import Header from '$lib/components/Header.svelte';
	import SongSearchModal from '$lib/components/SongSearchModal.svelte';
	import SongPreviewModal from '$lib/components/song_preview/SongPreviewModal.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import { page } from '$app/state';
	import { setCalendarState } from '$lib';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const session = $derived(page.data.session);
	
	// Initialize state with data from server
	const cal = setCalendarState();

	// Load songs when navigating months
	$effect(() => {
		if (session?.user) {
			cal.loadSongs();
		}
	});

	$effect(() => {
		if (data.songs) {
			cal.songsPerDay = cal.mapDbSongsToRecord(data.songs);
		}
	});

	$effect(() => {
		if (!session?.user) {
			cal.songsPerDay = {};
			cal.loadedMonths.clear();
		}
	});
</script>

<div class="h-screen w-screen overflow-hidden bg-bg flex flex-col relative">
	{#if cal.isLoading}
		<LoadingIndicator />
	{/if}

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

<SongPreviewModal
	song={cal.previewingSong}
	isOpen={!!cal.previewingSong}
	onClose={() => cal.closePreview()}
/>

<Toast />
