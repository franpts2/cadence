<script lang="ts">
	import type { Song } from '$lib/calendar.svelte';
	import CalendarDay from './CalendarDay.svelte';

	let { daysOfWeek, startDay, daysInMonth, isToday, isSelected, getSongsForDate, onSelectDate, onAddSong, onDeleteSong } = $props<{
		daysOfWeek: string[];
		startDay: number;
		daysInMonth: number;
		isToday: (day: number) => boolean;
		isSelected: (day: number) => boolean;
		getSongsForDate: (day: number) => Song[];
		onSelectDate: (day: number) => void;
		onAddSong: (day: number) => void;
		onDeleteSong: (day: number) => void;
	}>();
</script>

<div class="flex-1 flex flex-col overflow-hidden">
	<!-- Day Labels -->
	<div class="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950/50">
		{#each daysOfWeek as day}
			<div class="py-2 sm:py-3 text-center text-[8px] sm:text-[10px] font-bold text-zinc-500 tracking-widest md:tracking-[0.2em]">
				{day}
			</div>
		{/each}
	</div>

	<!-- Grid Cells -->
	<div class="flex-1 grid grid-cols-7 grid-rows-6">
		{#each Array(startDay) as _}
			<div class="border-b border-r border-zinc-900 bg-zinc-950/20"></div>
		{/each}

		{#each Array(daysInMonth) as _, i}
			{@const day = i + 1}
			<CalendarDay
				{day}
				isToday={isToday(day)}
				isSelected={isSelected(day)}
				songs={getSongsForDate(day)}
				onclick={() => onSelectDate(day)}
				onAddSong={() => onAddSong(day)}
				onDeleteSong={() => onDeleteSong(day)}
			/>
		{/each}

		<!-- Fill remaining grid cells -->
		{#each Array(42 - startDay - daysInMonth) as _}
			<div class="border-b border-r border-zinc-900 bg-zinc-950/20"></div>
		{/each}
	</div>
</div>
