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
</script>

<Modal {isOpen} {onClose}>
	{#if song}
		<SongPreviewCover
			imageUrl={song.album.images[0]?.url}
			albumName={song.album.name}
		/>

		<SongPreviewDetails
			name={song.name}
			artistName={song.artists[0]?.name ?? 'Unknown Artist'}
			albumName={song.album.name}
		/>

		<!-- Touch only: the day grid offers no delete affordance on touch, so it lives here -->
		{#if onDelete}
			<button
				onclick={() => onDelete()}
				class="pointer-fine:hidden absolute bottom-4 right-4 p-2.5 rounded-full text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors outline-none"
				aria-label="Remove song"
			>
				<TrashIcon class="h-5 w-5" />
			</button>
		{/if}
	{/if}
</Modal>
