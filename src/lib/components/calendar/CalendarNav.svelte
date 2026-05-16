<script lang="ts">
	import { getCalendarState, ChevronLeftIcon, ChevronRightIcon } from "$lib";

	const cal = getCalendarState();
</script>

<div class="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
	<button
		onclick={cal.prevMonth}
		class="p-2 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-zinc-100"
		aria-label="Previous Month"
	>
		<ChevronLeftIcon class="h-4 w-4" />
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
		<ChevronRightIcon class="h-4 w-4" />
	</button>
</div>
