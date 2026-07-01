<script lang="ts">
	let { class: className = "h-5 w-5" } = $props<{ class?: string }>();
</script>

<svg xmlns="http://www.w3.org/2000/svg" class={className} viewBox="0 0 24 24" fill="none">
	<circle cx="12" cy="12" r="10" fill="currentColor" />
	<path d="M8.5 12.5l2.5 2.5 5-5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
</svg>
