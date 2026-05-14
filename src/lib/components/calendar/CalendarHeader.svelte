<script lang="ts">
	import CalendarNav from "./CalendarNav.svelte";

	let { monthLabel, yearLabel, onPrev, onNext, onToday } = $props<{
		monthLabel: string;
		yearLabel: number;
		onPrev: () => void;
		onNext: () => void;
		onToday: () => void;
	}>();
</script>

<header
	class="flex items-center justify-between px-8 py-4 border-b border-zinc-800 bg-zinc-950"
>
	<div class="flex items-center gap-4">
		<h1 class="text-2xl font-light tracking-tighter text-zinc-400">
			CADENCE
		</h1>
		<div class="h-5 w-px bg-zinc-800"></div>
		<h2 class="text-xl text-zinc-100">
			{monthLabel} {yearLabel}
		</h2>
	</div>

	<CalendarNav {onPrev} {onNext} {onToday} />
</header>
