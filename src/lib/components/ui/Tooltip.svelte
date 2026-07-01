<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	let { 
		text,
		children,
		delay = 300
	}: { 
		text: string;
		children: Snippet;
		delay?: number;
	} = $props();

	let isHovered = $state(false);
	let showTooltip = $state(false);
	let timeoutId: any = null;

	function handleMouseEnter() {
		isHovered = true;
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			if (isHovered) {
				showTooltip = true;
			}
		}, delay);
	}

	function handleMouseLeave() {
		isHovered = false;
		showTooltip = false;
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	}
</script>

<div 
	class="relative inline-block w-full {showTooltip ? 'z-[100]' : 'z-0'}"
	role="presentation"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onfocusin={handleMouseEnter}
	onfocusout={handleMouseLeave}
>
	{@render children()}
	
	{#if showTooltip}
		<div 
			transition:fade={{ duration: 100 }}
			class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-surface border border-border rounded-lg text-[10px] font-medium leading-tight text-text-muted whitespace-nowrap z-[70] pointer-events-none shadow-2xl min-w-max"
		>
			<div class="flex flex-col gap-1 items-center">
				{#each text.split('\n') as line}
					<span>{line}</span>
				{/each}
			</div>
			<!-- Arrow -->
			<div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-x-[6px] border-x-transparent border-t-[6px] border-t-border"></div>
			<div class="absolute top-full left-1/2 -translate-x-1/2 -mt-[1.5px] border-x-[5px] border-x-transparent border-t-[5px] border-t-surface"></div>
		</div>
	{/if}
</div>
