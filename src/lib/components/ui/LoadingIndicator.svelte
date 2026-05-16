<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div 
	in:fade={{ duration: 200 }} 
	out:fade={{ duration: 200 }}
	class="absolute top-5 left-1/2 -translate-x-1/2 z-[100]"
>
	<div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-md shadow-2xl">
		<div class="w-3 h-3 border-2 border-zinc-500 border-t-zinc-100 rounded-full animate-spin"></div>
		<span class="text-[10px] font-medium text-zinc-100 uppercase tracking-widest">Syncing</span>
	</div>
</div>
