<script lang="ts">
	import Calendar from '$lib/components/calendar/Calendar.svelte';
	import Header from '$lib/components/Header.svelte';
	import SongSearchModal from '$lib/components/SongSearchModal.svelte';
	import SongPreviewModal from '$lib/components/song_preview/SongPreviewModal.svelte';
	import PlaylistControls from '$lib/components/PlaylistControls.svelte';
	import ImportPlaylistModal from '$lib/components/ImportPlaylistModal.svelte';
	import ExportPlaylistModal from '$lib/components/ExportPlaylistModal.svelte';
	import MoveConfirmModal from '$lib/components/MoveConfirmModal.svelte';
	import DeleteConfirmModal from '$lib/components/DeleteConfirmModal.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { setCalendarState } from '$lib';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const session = $derived(page.data.session);

	// Initialize state with data from server
	const cal = setCalendarState();

	// Load songs when navigating months
	$effect(() => {
		if (session?.user && !session.error) {
			cal.loadSongs();
		}
	});

	$effect(() => {
		if (session?.error === 'RefreshAccessTokenError') {
			cal.addToast('Your Spotify session has expired. Please log in again.', 'error');
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

	// Sync on resume, the way a native app does — no pull-to-refresh, no reload.
	// Coming back to the tab, or regaining the network, re-fetches the visible
	// month silently so edits made on another device appear.
	onMount(() => {
		const resync = () => {
			if (document.visibilityState === 'visible' && navigator.onLine) {
				cal.refreshCurrentMonth();
			}
		};

		document.addEventListener('visibilitychange', resync);
		window.addEventListener('online', resync);

		return () => {
			document.removeEventListener('visibilitychange', resync);
			window.removeEventListener('online', resync);
		};
	});
</script>

<div
	class="h-dvh w-full overflow-hidden bg-bg flex flex-col relative pb-[var(--safe-inset-bottom)]"
>
	{#if cal.isLoading}
		<LoadingIndicator />
	{/if}

	<Header {session} />

	<main class="flex-1 min-h-0 overflow-hidden flex flex-col pb-16 pointer-fine:pb-0">
		<!-- Crawlable, screen-reader description of the page. -->
		<section class="sr-only">
			<h2>Cadence — your daily music journal for Spotify</h2>
			<p>
				Cadence turns your Spotify listening into a personal music journal. Pick one song
				each day to build a visual calendar of your listening history, drag songs between
				days, and import or export Spotify playlists. Track your life, one song at a time.
			</p>
		</section>
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
	onDelete={() => cal.removePreviewSong()}
/>

<ImportPlaylistModal />

<ExportPlaylistModal />

<MoveConfirmModal />

<DeleteConfirmModal />

<PlaylistControls />

<Toast />
