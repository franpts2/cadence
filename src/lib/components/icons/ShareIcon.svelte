<script lang="ts">
	let { class: className = 'h-5 w-5' } = $props<{ class?: string }>();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	class={className}
	fill="none"
	viewBox="0 0 24 24"
	stroke="currentColor"
>
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="2"
		d="M8.7 13.7l6.6 3.8M15.3 6.5L8.7 10.3"
	/>
	<circle cx="18" cy="5" r="2.6" stroke-width="1.8" />
	<circle cx="6" cy="12" r="2.6" stroke-width="1.8" />
	<circle cx="18" cy="19" r="2.6" stroke-width="1.8" />
</svg>
