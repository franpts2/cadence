<script lang="ts">
	import type { Song } from '$lib/types';

	let { day, isToday, isSelected, songs = [], onclick, onAddSong, onDeleteSong } = $props<{
		day: number;
		isToday: boolean;
		isSelected: boolean;
		songs?: Song[];
		onclick: () => void;
		onAddSong: () => void;
		onDeleteSong: () => void;
	}>();

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onclick();
		}
	}

	const hasSong = $derived(songs && songs.length > 0);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	onclick={onclick}
	onkeydown={handleKeyDown}
	role="button"
	tabindex="0"
	class="relative group border-b border-r border-zinc-900 text-left p-1.5 sm:p-2 md:p-3 transition-colors h-full w-full min-h-[80px] md:min-h-[120px] flex flex-col cursor-default
		{isSelected ? 'bg-zinc-900/50' : 'hover:bg-zinc-900/30'}"
>
	<div class="flex justify-between items-start w-full">
		<span class="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm rounded-full transition-all
			{isToday ? 'bg-zinc-100 text-zinc-950 font-bold scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-zinc-400 group-hover:text-zinc-100'}
			{isSelected && !isToday ? 'ring-1 ring-zinc-700 text-zinc-100' : ''}">
			{day}
		</span>

		<div class="flex items-center gap-1">
			{#if hasSong}
				<button
					onclick={(e) => { e.stopPropagation(); onDeleteSong(); }}
					class="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity p-1 text-zinc-400"
					aria-label="Remove song"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
				</button>
			{:else}
				<button 
					onclick={(e) => { e.stopPropagation(); onAddSong(); }}
					class="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity p-1 text-zinc-400"
					aria-label="Add song"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
				</button>
			{/if}
		</div>
	</div>
	
	<div class="mt-2 space-y-1 overflow-hidden flex-1 w-full">
		{#each songs as song}
			<div class="w-full flex items-center gap-2 p-1 rounded bg-zinc-900/50 border border-zinc-800/50 overflow-hidden text-left">
				{#if song.album.images[0]}
					<img src={song.album.images[0].url} alt="" class="w-4 h-4 rounded-sm flex-shrink-0" />
				{/if}
				<span class="text-[10px] text-zinc-300 truncate font-medium group-hover:text-zinc-100">{song.name}</span>
			</div>
		{/each}
	</div>
	
	{#if isToday}
		<div class="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 md:bottom-3 md:right-3 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-zinc-100 animate-pulse"></div>
	{/if}
</div>
