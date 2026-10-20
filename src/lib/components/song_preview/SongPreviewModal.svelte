<script lang="ts">
	import type { Song } from '$lib/types';
	import { TrashIcon } from '$lib';
	import Modal from '../ui/Modal.svelte';
	import SongPreviewCover from './SongPreviewCover.svelte';
	import SongPreviewDetails from './SongPreviewDetails.svelte';

	let {
		song,
		isOpen,
		onClose,
		onDelete
	}: {
		song: Song | null;
		isOpen: boolean;
		onClose: () => void;
		onDelete?: () => void;
	} = $props();

	// The state clears `song` the moment the sheet closes. Hold the last song so
	// the sheet keeps its full height while it slides out instead of collapsing.
	let visibleSong = $state<Song | null>(null);
	$effect.pre(() => {
		if (song) visibleSong = song;
	});
</script>

<Modal {isOpen} {onClose}>
	{#if visibleSong}
		<SongPreviewCover
			imageUrl={visibleSong.album.images[0]?.url}
			albumName={visibleSong.album.name}
		/>

		<SongPreviewDetails
			name={visibleSong.name}
			artistName={visibleSong.artists[0]?.name ?? 'Unknown Artist'}
			albumName={visibleSong.album.name}
		/>

		<!-- Touch only: the day grid offers no delete affordance on touch, so it lives here -->
		{#if onDelete}
			<button
				onclick={() => onDelete()}
				class="pointer-fine:hidden absolute z-20 bottom-[calc(0.75rem+var(--safe-inset-bottom))] right-3 sm:bottom-4 sm:right-4 p-3 rounded-full text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors outline-none"
				aria-label="Remove song"
			>
				<TrashIcon class="h-5 w-5" />
			</button>
		{/if}
	{/if}
</Modal>
