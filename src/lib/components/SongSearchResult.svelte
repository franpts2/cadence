<script lang="ts">
	import type { Song } from '$lib';

	let { song, onclick }: { song: Song, onclick: () => void } = $props();
</script>

<button
	onclick={onclick}
	class="w-full flex items-center gap-4 p-3 hover:bg-zinc-800 rounded-lg transition-colors text-left group"
>
	{#if song.album.images[0]}
		<img src={song.album.images[0].url} alt="" class="w-10 h-10 rounded shadow-lg" />
	{:else}
		<div class="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
			</svg>
		</div>
	{/if}
	<div class="flex-1 min-w-0">
		<div class="text-zinc-100 font-medium truncate group-hover:text-white transition-colors">
			{song.name}
		</div>
		<div class="text-zinc-500 text-sm truncate group-hover:text-zinc-400 transition-colors">
			{song.artists.map(a => a.name).join(', ')}
		</div>
	</div>
</button>
