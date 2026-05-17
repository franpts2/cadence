<script lang="ts">
	import { type Song, TrashIcon, PlusIcon } from '$lib';
	import CalendarSong from './CalendarSong.svelte';

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

<div
	onclick={onclick}
	onkeydown={handleKeyDown}
	role="gridcell"
	tabindex="0"
	aria-current={isToday ? 'date' : undefined}
	aria-selected={isSelected}
	class="relative group border-b border-r border-border-dim text-left p-1.5 sm:p-2 md:p-3 transition-colors h-full w-full min-h-[80px] md:min-h-[120px] flex flex-col items-start focus:outline-none focus:bg-surface/40
		{isSelected ? 'bg-surface/50' : 'hover:bg-surface/30'}"
>
	<div class="flex justify-between items-start w-full pointer-events-none">
		<span class="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm rounded-full transition-all
			{isToday ? 'bg-text text-bg font-bold scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-text-muted group-hover:text-text'}
			{isSelected && !isToday ? 'ring-1 ring-border-subtle text-text' : ''}">
			{day}
		</span>

		<div class="flex items-center gap-1 pointer-events-auto">
			{#if hasSong}
				<button
					onclick={(e) => { e.stopPropagation(); onDeleteSong(); }}
					class="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity p-1 text-text-muted focus:opacity-100 outline-none"
					aria-label="Remove song for day {day}"
				>
					<TrashIcon class="h-4 w-4" />
				</button>
			{:else}
				<button 
					onclick={(e) => { e.stopPropagation(); onAddSong(); }}
					class="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity p-1 text-text-muted focus:opacity-100 outline-none"
					aria-label="Add song for day {day}"
				>
					<PlusIcon class="h-5 w-5" />
				</button>
			{/if}
		</div>
		</div>

		<div class="mt-2 space-y-1 overflow-hidden flex-1 w-full pointer-events-none">
		{#each songs as song}
			<CalendarSong {song} />
		{/each}
		</div>

		{#if isToday}
		<div class="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 md:bottom-3 md:right-3 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-text animate-pulse"></div>
		{/if}
		</div>

