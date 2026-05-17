<script lang="ts">
	import type { Song } from '$lib';

	let { song }: { song: Song } = $props();
</script>

<div class="w-full flex flex-col items-center gap-1 text-center px-1">
	{#if song.album.images[0]}
		<div class="w-full max-w-[4rem] sm:max-w-[5rem] md:max-w-[6rem] aspect-square overflow-hidden rounded-sm flex-shrink-0">
			<img src={song.album.images[0].url} alt="" class="w-full h-full object-cover" />
		</div>
	{/if}
	<span class="text-[9px] sm:text-[10px] text-accent-hover truncate font-medium w-full px-1">
		{song.name}
	</span>
</div>
