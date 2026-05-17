<script lang="ts">
	import { type Song, TrashIcon, PlusIcon, getCalendarState } from '$lib';
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

	const cal = getCalendarState();
	let isDraggingOver = $state(false);

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onclick();
		}
	}

	const hasSong = $derived(songs && songs.length > 0);

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		isDraggingOver = true;
	}

	function handleDragLeave() {
		isDraggingOver = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDraggingOver = false;
		const fromDay = e.dataTransfer?.getData('text/plain');
		if (fromDay) {
			cal.moveSong(parseInt(fromDay), day);
		}
	}
</script>

<div
	onclick={onclick}
	onkeydown={handleKeyDown}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	role="gridcell"
	tabindex="0"
	aria-current={isToday ? 'date' : undefined}
	aria-selected={isSelected}
	class="relative group border-b border-r border-border-dim text-left p-1.5 sm:p-2 transition-colors h-full w-full min-h-[90px] md:min-h-[130px] flex flex-col items-start justify-start md:items-center md:justify-center focus:outline-none
		{isSelected ? 'bg-surface/50' : 'hover:bg-surface/30'}
		{isDraggingOver ? 'bg-accent/10 ring-2 ring-inset ring-accent/30' : ''}"
>
	<div class="relative w-full md:absolute md:top-1.5 md:left-1.5 md:right-3 flex justify-between items-start z-10 pointer-events-none mb-1 md:mb-0 px-0.5 md:px-0">
		<span class="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs rounded-full transition-all
			{isToday ? 'bg-text text-bg font-bold scale-110' : 'text-text-muted group-hover:text-text'}
			{isSelected && !isToday ? 'ring-1 ring-border-subtle text-text' : ''}">
			{day}
		</span>

		<div class="flex items-center pointer-events-auto pr-2">
			{#if hasSong}
				<button
					onclick={(e) => { e.stopPropagation(); onDeleteSong(); }}
					class=" cursor-pointer opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity p-1 text-text-muted focus:opacity-100 outline-none"
					aria-label="Remove song for day {day}"
				>
					<TrashIcon class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
				</button>
			{:else}
				<button 
					onclick={(e) => { e.stopPropagation(); onAddSong(); }}
					class="cursor-pointer opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity p-1 text-text-muted focus:opacity-100 outline-none"
					aria-label="Add song for day {day}"
				>
					<PlusIcon class="h-4 w-4 sm:h-5 sm:w-5" />
				</button>
			{/if}
		</div>
	</div>

	<div class="w-full flex flex-col items-center justify-center overflow-hidden md:pt-2">
		{#each songs as song}
			<CalendarSong {song} {day} />
		{/each}
	</div>

	{#if isToday}
		<div class="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-text animate-pulse"></div>
	{/if}
</div>
