<script lang="ts">
	import { getCalendarState } from "$lib/state/calendar-state.svelte";

	const cal = getCalendarState();
</script>

<div class="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
	<button
		onclick={cal.prevMonth}
		class="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-zinc-100"
		aria-label="Previous Month"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
	</button>
	<button
		onclick={cal.goToToday}
		class="px-4 py-1 text-sm font-medium hover:bg-zinc-800 rounded-md transition-colors text-zinc-100"
	>
		Today
	</button>
	<button
		onclick={cal.nextMonth}
		class="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-zinc-100"
		aria-label="Next Month"
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
	</button>
</div>
