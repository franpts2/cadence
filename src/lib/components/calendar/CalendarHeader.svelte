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
	<h1 class="text-2xl font-light tracking-tight text-zinc-400">
		CADENCE 
		<span class="font-semibold text-zinc-100">{monthLabel} {yearLabel}</span>
	</h1>

	<CalendarNav {onPrev} {onNext} {onToday} />
</header>
