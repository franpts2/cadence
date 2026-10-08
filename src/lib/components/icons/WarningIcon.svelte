<script lang="ts">
	let { class: className = "h-5 w-5" } = $props<{ class?: string }>();
</script>

<svg xmlns="http://www.w3.org/2000/svg" class={className} viewBox="0 0 24 24" fill="none">
	<path d="M12 3.5c.78 0 1.49.42 1.87 1.1l7.85 13.9A2.13 2.13 0 0 1 19.85 21.75H4.15A2.13 2.13 0 0 1 2.28 18.5l7.85-13.9c.38-.68 1.09-1.1 1.87-1.1z" fill="currentColor" />
	<path d="M12 9v4.5" stroke="#1c1917" stroke-width="2.5" stroke-linecap="round" />
	<circle cx="12" cy="17.25" r="1.25" fill="#1c1917" />
</svg>
