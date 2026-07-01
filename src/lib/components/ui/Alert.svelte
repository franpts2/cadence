<script lang="ts">
	import type { Snippet } from 'svelte';
	import ErrorIcon from '../icons/ErrorIcon.svelte';
	import WarningIcon from '../icons/WarningIcon.svelte';
	import SuccessIcon from '../icons/SuccessIcon.svelte';
	import InfoIcon from '../icons/InfoIcon.svelte';
	import QuestionIcon from '../icons/QuestionIcon.svelte';

	let { 
		title = '', 
		variant = 'warning',
		children 
	}: { 
		title?: string, 
		variant?: 'error' | 'warning' | 'success' | 'info' | 'question',
		children?: Snippet 
	} = $props();

	// Style mappings based on the provided images
	const variants = {
		error: {
			container: 'bg-[#2b1215] border-[#f87171]/10 text-white',
			iconColor: 'text-[#ef4444]',
			descColor: 'text-[#e5b1b6]'
		},
		warning: {
			container: 'bg-[#2f1d07] border-[#fbbf24]/10 text-white',
			iconColor: 'text-[#fbbf24]',
			descColor: 'text-[#ebd4b8]'
		},
		success: {
			container: 'bg-[#0f2214] border-[#4ade80]/10 text-white',
			iconColor: 'text-[#22c55e]',
			descColor: 'text-[#b9dfc4]'
		},
		info: {
			container: 'bg-[#151e36] border-[#60a5fa]/10 text-white',
			iconColor: 'text-[#3b82f6]',
			descColor: 'text-[#b9cbe6]'
		},
		question: {
			container: 'bg-[#1d202b] border-[#94a3b8]/10 text-white',
			iconColor: 'text-[#94a3b8]',
			descColor: 'text-[#c6cad6]'
		}
	};
</script>

<div class="p-4 border rounded-xl flex items-start gap-3.5 transition-all {variants[variant].container}">
	<!-- Icon -->
	<div class="flex-shrink-0 mt-0.5 {variants[variant].iconColor}">
		{#if variant === 'error'}
			<ErrorIcon class="h-5 w-5" />
		{:else}
			{#if variant === 'warning'}
				<WarningIcon class="h-5 w-5" />
			{:else if variant === 'success'}
				<SuccessIcon class="h-5 w-5" />
			{:else if variant === 'info'}
				<InfoIcon class="h-5 w-5" />
			{:else if variant === 'question'}
				<QuestionIcon class="h-5 w-5" />
			{/if}
		{/if}
	</div>

	<!-- Content -->
	<div class="flex flex-col gap-0.5">
		{#if title}
			<span class="font-semibold text-sm text-white leading-snug">{title}</span>
		{/if}
		{#if children}
			<div class="text-[12.5px] leading-relaxed mt-0.5 {variants[variant].descColor}">
				{@render children()}
			</div>
		{/if}
	</div>
</div>
