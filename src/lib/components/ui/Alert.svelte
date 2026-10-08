<script lang="ts">
	import type { Snippet } from 'svelte';
	import WarningIcon from '../icons/WarningIcon.svelte';
	import InfoIcon from '../icons/InfoIcon.svelte';
	import SuccessIcon from '../icons/SuccessIcon.svelte';

	let { 
		title = 'Warning', 
		variant = 'error',
		children 
	}: { 
		title?: string, 
		variant?: 'error' | 'warning' | 'info' | 'success',
		children: Snippet 
	} = $props();

	const variants = {
		error: 'bg-red-500/10 border-red-500/20 text-red-500',
		warning: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
		info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
		success: 'bg-green-500/10 border-green-500/20 text-green-500'
	};

	const textColors = {
		error: 'text-red-200/80',
		warning: 'text-orange-200/80',
		info: 'text-blue-200/80',
		success: 'text-green-200/80'
	};
</script>

<div class="p-4 border rounded-xl {variants[variant]}">
	<div class="flex gap-2 mb-1">
		{#if variant === 'success'}
			<SuccessIcon class="h-4 w-4 mt-0.5" />
		{:else if variant === 'error' || variant === 'warning'}
			<WarningIcon class="h-4 w-4 mt-0.5" />
		{:else}
			<InfoIcon class="h-4 w-4 mt-0.5" />
		{/if}
		<span class="text-xs font-bold uppercase tracking-wider">{title}</span>
	</div>
	<div class="text-[11px] leading-relaxed {textColors[variant]}">
		{@render children()}
	</div>
</div>
