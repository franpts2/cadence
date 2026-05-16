<script lang="ts">
	import { getCalendarState, CloseIcon } from '$lib';
	import { fade, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	const cal = getCalendarState();
</script>

<div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-xs pointer-events-none">
	{#each cal.toasts as toast (toast.id)}
		<div
			animate:flip={{ duration: 300 }}
			in:slide={{ axis: 'y' }}
			out:fade
			class="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg border border-zinc-800 bg-zinc-900 text-sm text-white"
		>
			<div class="flex items-center gap-2">
				<div class="w-1.5 h-1.5 rounded-full 
					{toast.type === 'success' ? 'bg-emerald-500' : ''}
					{toast.type === 'error' ? 'bg-red-500' : ''}
					{toast.type === 'info' ? 'bg-sky-500' : ''}"
				></div>
				<span>{toast.message}</span>
			</div>
			<button 
				onclick={() => cal.removeToast(toast.id)}
				class="text-zinc-500 hover:text-zinc-300 transition-colors"
			>
				<CloseIcon class="h-4 w-4" />
			</button>
		</div>
	{/each}
</div>
