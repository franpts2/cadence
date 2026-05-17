<script lang="ts">
	import { getCalendarState, DAYS_OF_WEEK, isSameDay, MONTHS } from '$lib';
	import CalendarDay from './CalendarDay.svelte';
	import CalendarSong from './CalendarSong.svelte';

	let { startDay, daysInMonth } = $props<{
		startDay: number;
		daysInMonth: number;
	}>();

	const cal = getCalendarState();

	function isToday(day: number) {
		const date = new Date(cal.viewDate.getFullYear(), cal.viewDate.getMonth(), day);
		return isSameDay(new Date(), date);
	}

	function isSelected(day: number) {
		const date = new Date(cal.viewDate.getFullYear(), cal.viewDate.getMonth(), day);
		return isSameDay(cal.selectedDate, date);
	}

	let hoveringType = $state<'prev' | 'next' | null>(null);

	function handleEnter(type: 'prev' | 'next') {
		if (!cal.draggingSong) return;
		hoveringType = type;
		cal.startDelayedNav(type);
	}

	function handleLeave() {
		hoveringType = null;
		cal.cancelDelayedNav();
	}
</script>

<div class="flex-1 flex flex-col overflow-hidden">
	<!-- Day Labels -->
	<div class="grid grid-cols-7 border-b border-border bg-bg/50">
		{#each DAYS_OF_WEEK as day}
			<div class="py-2 sm:py-3 text-center text-[8px] sm:text-[10px] font-bold text-text-dim tracking-widest md:tracking-[0.2em]">
				{day}
			</div>
		{/each}
	</div>

	<!-- Grid Cells -->
	<div class="flex-1 grid grid-cols-7 grid-rows-6">
		{#each Array(startDay) as _, i}
			<div 
				class="relative border-b border-r border-border-dim bg-bg/20 transition-colors flex items-center justify-center p-2 text-center"
				ondragenter={() => handleEnter('prev')}
				ondragleave={handleLeave}
				ondragover={(e) => e.preventDefault()}
			>
				{#if i === startDay - 1 && hoveringType === 'prev' && cal.navTargetDate}
					<div class="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
						<div class="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
						<span class="text-[9px] font-medium text-accent uppercase tracking-tight">
							Moving to {MONTHS[cal.navTargetDate.getMonth()]} {cal.navTargetDate.getFullYear()}...
						</span>
					</div>
				{/if}
			</div>
		{/each}

		{#each Array(daysInMonth) as _, i}
			{@const day = i + 1}
			<CalendarDay
				{day}
				isToday={isToday(day)}
				isSelected={isSelected(day)}
				songs={cal.getSongsForDay(day)}
				onclick={() => cal.selectDate(day)}
				onAddSong={() => cal.startSearchForDay(day)}
				onDeleteSong={() => cal.removeSongFromDate(day)}
			/>
		{/each}

		<!-- Fill remaining grid cells -->
		{#each Array(42 - startDay - daysInMonth) as _, i}
			<div 
				class="relative border-b border-r border-border-dim bg-bg/20 transition-colors flex items-center justify-center p-2 text-center"
				ondragenter={() => handleEnter('next')}
				ondragleave={handleLeave}
				ondragover={(e) => e.preventDefault()}
			>
				{#if i === 0 && hoveringType === 'next' && cal.navTargetDate}
					<div class="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
						<div class="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
						<span class="text-[9px] font-medium text-accent uppercase tracking-tight">
							Moving to {MONTHS[cal.navTargetDate.getMonth()]} {cal.navTargetDate.getFullYear()}...
						</span>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Hidden persistent source for dragging across months -->
	{#if cal.draggingSong}
		<div class="hidden" aria-hidden="true">
			<CalendarSong song={cal.draggingSong} day={cal.draggingFromDay ?? 0} />
		</div>
	{/if}
</div>
