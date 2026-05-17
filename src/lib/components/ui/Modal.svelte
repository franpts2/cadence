<script lang="ts">
	import { fade, fly } from 'svelte/transition';
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
		class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
		transition:fade={{ duration: 200 }}
	>
		<!-- Backdrop -->
		<div
			class="absolute inset-0 bg-bg/80 backdrop-blur-md"
			onclick={onClose}
			aria-hidden="true"
		></div>

		<!-- Modal Content -->
		<div
			class="relative w-full max-w-sm bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center p-6 pt-12 text-center border border-border/50"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<button
				onclick={onClose}
				class="absolute top-2 right-2 p-2 text-text-muted hover:text-text transition-colors z-10"
				aria-label="Close"
			>
				<CloseIcon class="h-6 w-6" />
			</button>

			{@render children()}
		</div>
	</div>
{/if}
