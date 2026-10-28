<script lang="ts">
	import { pop } from '$lib';
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

	let trigger = $state<HTMLElement>();
	let tooltip = $state<HTMLElement>();
	let isHovered = $state(false);
	let showTooltip = $state(false);
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	// Keep the bubble inside the viewport, with a little breathing room.
	const EDGE = 8;
	// Distance between the trigger and the bubble (matches `mb-2`).
	const GAP = 8;

	let placement = $state<'top' | 'bottom'>('top');
	let arrowX = $state(0);
	let left = $state(0);
	let top = $state(0);

	function handleMouseEnter() {
		// Touch has no hover. Without this gate, a tap would pin the tooltip open
		// until the user taps something else.
		if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
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

	// Calendar cells clip their contents (`overflow-hidden`), so an absolutely
	// positioned tooltip gets cut off at the cell edge. Move it to <body> and use
	// fixed coordinates instead, which also lets us clamp it to the viewport.
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	function place() {
		if (!trigger || !tooltip) return;

		const anchor = trigger.getBoundingClientRect();
		// offsetWidth/Height ignore the enter transition's scale transform.
		const width = tooltip.offsetWidth;
		const height = tooltip.offsetHeight;
		const viewportWidth = document.documentElement.clientWidth;
		const viewportHeight = document.documentElement.clientHeight;
		const anchorCenter = anchor.left + anchor.width / 2;

		left = Math.min(
			Math.max(EDGE, anchorCenter - width / 2),
			Math.max(EDGE, viewportWidth - width - EDGE)
		);

		const above = anchor.top - height - GAP;
		placement = above >= EDGE ? 'top' : 'bottom';
		top =
			placement === 'top'
				? above
				: Math.min(anchor.bottom + GAP, viewportHeight - height - EDGE);

		// Point the arrow at the trigger, even when the bubble is clamped.
		arrowX = Math.min(Math.max(10, anchorCenter - left), Math.max(10, width - 10));
	}

	$effect(() => {
		if (!showTooltip) return;

		// Measure after the portalled node has been laid out.
		const frame = requestAnimationFrame(place);
		window.addEventListener('scroll', place, true);
		window.addEventListener('resize', place);

		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', place, true);
			window.removeEventListener('resize', place);
		};
	});
</script>

<div
	bind:this={trigger}
	class="relative inline-block w-full"
	role="presentation"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onfocusin={handleMouseEnter}
	onfocusout={handleMouseLeave}
>
	{@render children()}

	{#if showTooltip}
		<div
			bind:this={tooltip}
			use:portal
			transition:pop={{ duration: 125, start: 0.97 }}
			style="left: {left}px; top: {top}px; transform-origin: {placement === 'top'
				? 'bottom'
				: 'top'} center;"
			class="fixed px-3 py-2 bg-surface border border-border rounded-lg text-[10px] font-medium leading-tight text-text-muted whitespace-nowrap z-[120] pointer-events-none shadow-2xl"
		>
			<div class="flex flex-col gap-1 items-center">
				{#each text.split('\n') as line}
					<span>{line}</span>
				{/each}
			</div>
			<!-- Arrow, offset to point at the trigger -->
			{#if placement === 'top'}
				<div
					class="absolute top-full -mt-px -translate-x-1/2 border-x-[6px] border-x-transparent border-t-[6px] border-t-border"
					style="left: {arrowX}px"
				></div>
				<div
					class="absolute top-full -mt-[1.5px] -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-surface"
					style="left: {arrowX}px"
				></div>
			{:else}
				<div
					class="absolute bottom-full -mb-px -translate-x-1/2 border-x-[6px] border-x-transparent border-b-[6px] border-b-border"
					style="left: {arrowX}px"
				></div>
				<div
					class="absolute bottom-full -mb-[1.5px] -translate-x-1/2 border-x-[5px] border-x-transparent border-b-[5px] border-b-surface"
					style="left: {arrowX}px"
				></div>
			{/if}
		</div>
	{/if}
</div>
