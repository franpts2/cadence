<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div 
	in:fade={{ duration: 200 }} 
	out:fade={{ duration: 200 }}
	class="absolute top-5 left-1/2 -translate-x-1/2 z-[100]"
>
	<div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/90 border border-border backdrop-blur-md shadow-2xl">
		<div class="w-3 h-3 border-2 border-text-dim border-t-text rounded-full animate-spin"></div>
		<span class="text-[10px] font-medium text-text uppercase tracking-widest">Syncing</span>
	</div>
</div>
