<script lang="ts">
	import type { Snippet } from 'svelte';

	let { 
		title = 'Warning', 
		variant = 'error',
		children 
	}: { 
		title?: string, 
		variant?: 'error' | 'warning' | 'info',
		children: Snippet 
	} = $props();

	const variants = {
		error: 'bg-red-500/10 border-red-500/20 text-red-500',
		warning: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
		info: 'bg-blue-500/10 border-blue-500/20 text-blue-500'
	};

	const textColors = {
		error: 'text-red-200/80',
		warning: 'text-orange-200/80',
		info: 'text-blue-200/80'
	};
</script>

<div class="p-4 border rounded-xl {variants[variant]}">
	<div class="flex gap-2 mb-1">
		{#if variant === 'error' || variant === 'warning'}
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
		{/if}
		<span class="text-xs font-bold uppercase tracking-wider">{title}</span>
	</div>
	<div class="text-[11px] leading-relaxed {textColors[variant]}">
		{@render children()}
	</div>
</div>
