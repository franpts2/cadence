<script lang="ts">
	import type { Song } from '$lib';

	let { song }: { song: Song } = $props();
</script>

<div class="w-full flex items-center gap-2 p-1 rounded bg-surface/50 border-border/50 overflow-hidden text-left">
	{#if song.album.images[0]}
		<img src={song.album.images[0].url} alt="" class="w-4 h-4 rounded-sm flex-shrink-0" />
	{/if}
	<span class="text-[10px] text-accent-hover truncate font-medium group-hover:text-text">{song.name}</span>
</div>
