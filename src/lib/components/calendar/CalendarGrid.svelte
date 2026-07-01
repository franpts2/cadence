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

	function handleEnter(type: 'prev' | 'next') {
		if (!cal.draggingSong) return;
		cal.startDelayedNav(type);
	}

	function handleLeave() {
		cal.cancelDelayedNav();
	}
</script>

<div class="flex-1 flex flex-col relative">
	<!-- Day Labels - Also acts as a fallback for Prev Month nav if no blank cells -->
	<div 
		class="relative grid grid-cols-7 border-b border-border bg-bg/50"
		data-nav-target="prev"
		role="row"
		tabindex="-1"
		ondragenter={() => handleEnter('prev')}
		ondragleave={handleLeave}
		ondragover={(e) => e.preventDefault()}
	>
		{#each DAYS_OF_WEEK as day}
			<div class="py-2 sm:py-3 text-center text-[8px] sm:text-[10px] font-bold text-text-dim tracking-widest md:tracking-[0.2em]">
				{day}
			</div>
		{/each}

		{#if startDay === 0 && cal.hoveringType === 'prev' && cal.navTargetDate}
			<div class="absolute inset-0 flex items-center justify-center bg-bg/90 backdrop-blur-sm z-[60] animate-in fade-in duration-200">
				<div class="flex items-center gap-3">
					<div class="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
					<span class="text-[10px] font-bold text-accent uppercase tracking-widest">
						Moving to {MONTHS[cal.navTargetDate.getMonth()]} {cal.navTargetDate.getFullYear()}...
					</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Grid Cells -->
	<div class="flex-1 grid grid-cols-7 grid-rows-6">
		{#each Array(startDay) as _, i}
			<div 
				class="relative border-b border-r border-border-dim bg-bg/20 transition-colors flex items-center justify-center p-2 text-center"
				data-nav-target="prev"
				role="gridcell"
				tabindex="-1"
				ondragenter={() => handleEnter('prev')}
				ondragleave={handleLeave}
				ondragover={(e) => e.preventDefault()}
			>
				{#if i === startDay - 1 && cal.hoveringType === 'prev' && cal.navTargetDate}
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
				data-nav-target="next"
				role="gridcell"
				tabindex="-1"
				ondragenter={() => handleEnter('next')}
				ondragleave={handleLeave}
				ondragover={(e) => e.preventDefault()}
			>
				{#if i === 0 && cal.hoveringType === 'next' && cal.navTargetDate}
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

	<!-- Fallback for Next Month nav if grid is full -->
	<div 
		class="h-2 w-full transition-colors {cal.draggingSong ? 'bg-accent/5' : ''}"
		data-nav-target="next"
		role="region"
		aria-label="Next Month Drag Zone"
		ondragenter={() => handleEnter('next')}
		ondragleave={handleLeave}
		ondragover={(e) => e.preventDefault()}
	>
		{#if (42 - startDay - daysInMonth) === 0 && cal.hoveringType === 'next' && cal.navTargetDate}
			<div class="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center bg-bg/90 backdrop-blur-sm z-[60] border-t border-accent/20 animate-in slide-in-from-bottom-4 duration-300">
				<div class="flex items-center gap-3">
					<div class="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
					<span class="text-[10px] font-bold text-accent uppercase tracking-widest">
						Moving to {MONTHS[cal.navTargetDate.getMonth()]} {cal.navTargetDate.getFullYear()}...
					</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Hidden persistent source for dragging across months -->
	{#if cal.draggingSong}
		<div class="hidden" aria-hidden="true">
			<CalendarSong song={cal.draggingSong} day={cal.draggingFromDay ?? 0} />
		</div>
	{/if}
</div>
