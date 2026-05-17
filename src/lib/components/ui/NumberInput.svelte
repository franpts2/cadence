<script lang="ts">
	import ChevronUpIcon from '../icons/ChevronUpIcon.svelte';
	import ChevronDownIcon from '../icons/ChevronDownIcon.svelte';

	let { value = $bindable(), min, max, id } = $props<{
		value: number;
		min?: number;
		max?: number;
		id?: string;
	}>();

	function increment() {
		if (max === undefined || value < max) value++;
	}

	function decrement() {
		if (min === undefined || value > min) value--;
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const val = parseInt(target.value);
		if (!isNaN(val)) {
			value = val;
		}
	}
</script>

<div class="relative w-full">
	<input
		{id}
		type="number"
		{value}
		oninput={handleInput}
		{min}
		{max}
		class="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all no-spinner"
	/>
	<div class="absolute right-2 inset-y-0 flex flex-col justify-center">
		<button
			type="button"
			onclick={increment}
			class="p-0.5 text-text-muted hover:text-text hover:bg-surface-hover rounded transition-colors"
			aria-label="Increment"
		>
			<ChevronUpIcon class="h-3 w-3" />
		</button>
		<button
			type="button"
			onclick={decrement}
			class="p-0.5 text-text-muted hover:text-text hover:bg-surface-hover rounded transition-colors"
			aria-label="Decrement"
		>
			<ChevronDownIcon class="h-3 w-3" />
		</button>
	</div>
</div>

<style>
	.no-spinner::-webkit-outer-spin-button,
	.no-spinner::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.no-spinner {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>
