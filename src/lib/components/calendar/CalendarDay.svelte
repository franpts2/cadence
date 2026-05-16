<script lang="ts">
	let { day, isToday, isSelected, onclick } = $props<{
		day: number;
		isToday: boolean;
		isSelected: boolean;
		onclick: () => void;
	}>();
</script>

<button
	{onclick}
	class="relative group border-b border-r border-zinc-900 text-left p-1.5 sm:p-2 md:p-3 transition-colors
		{isSelected ? 'bg-zinc-900/50' : 'hover:bg-zinc-900/30'}"
>
	<span class="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm rounded-full transition-all
		{isToday ? 'bg-zinc-100 text-zinc-950 font-bold scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-zinc-400 group-hover:text-zinc-100'}
		{isSelected && !isToday ? 'ring-1 ring-zinc-700 text-zinc-100' : ''}">
		{day}
	</span>
	
	{#if isToday}
		<div class="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 md:bottom-3 md:right-3 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-zinc-100 animate-pulse"></div>
	{/if}
</button>
