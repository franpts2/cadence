<script lang="ts">
	import { getCalendarState, ChevronLeftIcon, ChevronRightIcon } from "$lib";

	const cal = getCalendarState();
</script>

<div class="flex items-center bg-surface rounded-lg p-1 border border-border">
	<button
		onclick={cal.prevMonth}
		class="flex h-8 w-8 items-center justify-center hover:bg-surface-hover rounded-md transition-colors text-text-muted hover:text-text"
		aria-label="Previous Month"
	>
		<ChevronLeftIcon class="h-4 w-4" />
	</button>
	<button
		onclick={cal.goToToday}
		class="flex h-8 items-center px-4 text-sm font-medium hover:bg-surface-hover rounded-md transition-colors text-text"
	>
		Today
	</button>
	<button
		onclick={cal.nextMonth}
		class="flex h-8 w-8 items-center justify-center hover:bg-surface-hover rounded-md transition-colors text-text-muted hover:text-text"
		aria-label="Next Month"
	>
		<ChevronRightIcon class="h-4 w-4" />
	</button>
</div>
