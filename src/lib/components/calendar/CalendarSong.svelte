<script lang="ts">
	import { getCalendarState, type Song } from '$lib';

	let { song }: { song: Song } = $props();
	const cal = getCalendarState();

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		cal.openPreview(song);
	}
</script>

<button 
	onclick={handleClick}
	class="w-full flex flex-col items-center gap-1 text-center px-1 outline-none rounded-lg transition-all"
>
	{#if song.album.images[0]}
		<div class="w-full max-w-[4rem] sm:max-w-[5rem] md:max-w-[6rem] aspect-square overflow-hidden rounded-sm shadow-[0_4px_12px_rgba(150,150,150,0.2)] flex-shrink-0">
			<img src={song.album.images[0].url} alt="" class="w-full h-full object-cover" />
		</div>
	{/if}
	<span class="text-[9px] sm:text-[10px] text-accent-hover truncate font-medium w-full px-1">
		{song.name}
	</span>
</button>
