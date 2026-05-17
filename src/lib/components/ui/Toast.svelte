<script lang="ts">
	import { getCalendarState, CloseIcon } from '$lib';
	import { fade, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	const cal = getCalendarState();
</script>

<div class="fixed top-2 left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-2 w-full max-w-xs pointer-events-none">
	{#each cal.toasts as toast (toast.id)}
		<div
			animate:flip={{ duration: 300 }}
			in:slide={{ axis: 'y' }}
			out:fade
			class="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-xl border border-border bg-surface/95 backdrop-blur-md text-sm text-white"
		>
			<div class="flex items-center gap-2">
				<span>{toast.message}</span>
			</div>
			<button 
				onclick={() => cal.removeToast(toast.id)}
				class="text-text-dim hover:text-accent-hover transition-colors"
			>
				<CloseIcon class="h-4 w-4" />
			</button>
		</div>
	{/each}
</div>
