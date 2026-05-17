<script lang="ts">
	import { getCalendarState, type Song } from '$lib';

	let { song, day }: { song: Song; day: number } = $props();
	const cal = getCalendarState();

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		cal.openPreview(song);
	}

	function handleDragStart(e: DragEvent) {
		if (e.dataTransfer) {
			e.dataTransfer.setData('text/plain', day.toString());
			e.dataTransfer.effectAllowed = 'move';
			cal.draggingSong = song;
			cal.draggingFromDay = day;
		}
	}

	function handleDragEnd() {
		cal.draggingSong = null;
		cal.draggingFromDay = null;
	}
</script>

<button 
	onclick={handleClick}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	draggable="true"
	class="w-full flex flex-col items-center gap-1 text-center px-1 outline-none rounded-lg transition-all cursor-grab active:cursor-grabbing hover:bg-surface/50"
>
	{#if song.album.images[0]}
		<div class="w-full max-w-[4rem] sm:max-w-[5rem] md:max-w-[6rem] aspect-square overflow-hidden rounded-sm flex-shrink-0">
			<img src={song.album.images[0].url} alt="" class="w-full h-full object-cover" />
		</div>
	{/if}
	<span class="text-[9px] sm:text-[10px] text-accent-hover truncate font-medium w-full px-1">
		{song.name}
	</span>
</button>
