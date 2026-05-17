<script lang="ts">
	import ChevronDownIcon from '../icons/ChevronDownIcon.svelte';
	import { fade } from 'svelte/transition';

	interface Option {
		value: any;
		label: string;
	}

	let { value = $bindable(), options, placeholder = 'Select...', id } = $props<{
		value: any;
		options: Option[];
		placeholder?: string;
		id?: string;
	}>();

	let isOpen = $state(false);

	function selectOption(opt: Option) {
		value = opt.value;
		isOpen = false;
	}

	const selectedLabel = $derived(options.find((o: Option) => o.value === value)?.label ?? placeholder);
</script>

<div class="relative w-full">
	<button
		{id}
		type="button"
		onclick={() => (isOpen = !isOpen)}
		class="w-full flex items-center justify-between px-4 py-2.5 bg-bg border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all text-left"
	>
		<span class="truncate">{selectedLabel}</span>
		<ChevronDownIcon class="h-4 w-4 text-text-muted transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
	</button>

	{#if isOpen}
		<!-- Backdrop for closing -->
		<button
			type="button"
			class="fixed inset-0 z-[60] bg-transparent cursor-default"
			onclick={() => (isOpen = false)}
			aria-label="Close dropdown"
		></button>

		<div
			class="absolute z-[70] w-full mt-2 bg-bg border border-border rounded-xl shadow-xl overflow-hidden py-1.5"
			transition:fade={{ duration: 100 }}
		>
			<div class="max-h-60 overflow-y-auto">
				{#each options as option}
					<button
						type="button"
						onclick={() => selectOption(option)}
						class="w-full px-4 py-2 text-sm text-left hover:bg-surface-hover transition-colors {value === option.value
							? 'text-accent font-medium bg-accent/5'
							: 'text-text'}"
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
