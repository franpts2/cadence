<script lang="ts">
	import { getCalendarState, ChevronLeftIcon, ChevronRightIcon } from "$lib";

	const cal = getCalendarState();
</script>

<!-- 44px hit targets, but light on the eye: no container chrome on phones, 18px
     chevrons and a compact Today label. The segmented control returns on desktop. -->
<div class="flex items-center md:bg-surface md:rounded-lg md:border md:border-border">
	<button
		onclick={cal.prevMonth}
		class="flex h-11 w-11 items-center justify-center hover:bg-surface-hover rounded-lg transition-colors text-text-muted hover:text-text md:h-8 md:w-8 md:rounded-md"
		aria-label="Previous Month"
	>
		<ChevronLeftIcon class="h-[18px] w-[18px] md:h-4 md:w-4" />
	</button>
	<button
		onclick={cal.goToToday}
		class="flex h-11 items-center px-2.5 text-[13px] font-medium hover:bg-surface-hover rounded-lg transition-colors text-text md:h-8 md:px-4 md:rounded-md md:text-sm"
	>
		Today
	</button>
	<button
		onclick={cal.nextMonth}
		class="flex h-11 w-11 items-center justify-center hover:bg-surface-hover rounded-lg transition-colors text-text-muted hover:text-text md:h-8 md:w-8 md:rounded-md"
		aria-label="Next Month"
	>
		<ChevronRightIcon class="h-[18px] w-[18px] md:h-4 md:w-4" />
	</button>
</div>
