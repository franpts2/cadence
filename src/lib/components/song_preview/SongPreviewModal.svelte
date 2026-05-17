<script lang="ts">
	import type { Song } from '$lib/types';
	import Modal from '../ui/Modal.svelte';
	import SongPreviewCover from './SongPreviewCover.svelte';
	import SongPreviewDetails from './SongPreviewDetails.svelte';

	let { song, isOpen, onClose } = $props<{
		song: Song | null;
		isOpen: boolean;
		onClose: () => void;
	}>();
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
	{/if}
</Modal>
