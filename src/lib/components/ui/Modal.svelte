<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from '$lib';
	import type { Snippet } from 'svelte';
	import CloseIcon from '../icons/CloseIcon.svelte';

	let { isOpen, onClose, children } = $props<{
		isOpen: boolean;
		onClose: () => void;
		children: Snippet;
	}>();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6"
		transition:fade={{ duration: 150, easing: cubicOut }}
	>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-bg/80 backdrop-blur-md"
			onclick={onClose}
			aria-hidden="true"
		></div>

		<!-- Modal content: a bottom sheet on phones, a centred dialog from sm up.
		     The body scrolls so long forms and the keyboard never push it off-screen. -->
		<div
			role="dialog"
			aria-modal="true"
			class="relative w-full max-w-sm bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[85dvh] rounded-t-2xl sm:rounded-2xl border border-border/50"
			transition:fly={{ y: prefersReducedMotion() ? 0 : 20, duration: 200, easing: cubicOut }}
		>
			<!-- Sheet grabber, decorative -->
			<div class="sm:hidden shrink-0 h-4 flex items-start justify-center pt-2" aria-hidden="true">
				<div class="h-1 w-10 rounded-full bg-border-subtle/60"></div>
			</div>

			<button
				onclick={onClose}
				class="absolute top-2 right-2 z-20 p-3 text-text-muted hover:text-text hover:bg-surface-hover transition-colors rounded-full"
				aria-label="Close"
			>
				<CloseIcon class="h-5 w-5" />
			</button>

			<div
				class="w-full overflow-y-auto overscroll-contain flex flex-col items-center p-6 pt-10 pb-[calc(1.5rem+var(--safe-inset-bottom))] text-center sm:pt-12 sm:pb-6"
			>
				{@render children()}
			</div>
		</div>
	</div>
{/if}
