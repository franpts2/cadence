<script lang="ts">
	import type { Song } from '$lib';

	let { song }: { song: Song } = $props();
</script>

<div class="w-full flex items-center gap-2 p-1 rounded bg-zinc-900/50 border border-zinc-800/50 overflow-hidden text-left">
	{#if song.album.images[0]}
		<img src={song.album.images[0].url} alt="" class="w-4 h-4 rounded-sm flex-shrink-0" />
	{/if}
	<span class="text-[10px] text-zinc-300 truncate font-medium group-hover:text-zinc-100">{song.name}</span>
</div>
