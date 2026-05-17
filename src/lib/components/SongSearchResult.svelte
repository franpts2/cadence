<script lang="ts">
	import { type Song, MusicIcon } from '$lib';

	let { song, onclick }: { song: Song, onclick: () => void } = $props();
</script>

<button
	onclick={onclick}
	class="w-full flex items-center gap-4 p-3 hover:bg-surface-hover rounded-lg transition-colors text-left group"
>
	{#if song.album.images[0]}
		<img src={song.album.images[0].url} alt="" class="w-10 h-10 rounded shadow-lg" />
	{:else}
		<div class="w-10 h-10 bg-surface-hover rounded flex items-center justify-center">
			<MusicIcon class="h-5 w-5 text-text-subtle" />
		</div>
	{/if}
	<div class="flex-1 min-w-0">
		<div class="text-text font-medium truncate group-hover:text-white transition-colors">
			{song.name}
		</div>
		<div class="text-text-dim text-sm truncate group-hover:text-text-muted transition-colors">
			{song.artists.map(a => a.name).join(', ')}
		</div>
	</div>
</button>
