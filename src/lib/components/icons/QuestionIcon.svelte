<script lang="ts">
	let { class: className = "h-5 w-5" } = $props<{ class?: string }>();
</script>

<svg xmlns="http://www.w3.org/2000/svg" class={className} viewBox="0 0 24 24" fill="none">
	<circle cx="12" cy="12" r="10" fill="currentColor" />
	<path d="M9.5 9.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5c0 1.25-.75 1.9-1.5 2.5-.7.56-1 1.25-1 2" stroke="white" stroke-width="2" stroke-linecap="round" fill="none" />
	<circle cx="12" cy="16.5" r="1" fill="white" />
</svg>
