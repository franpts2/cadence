<script lang="ts">
	import PlayIcon from '../icons/PlayIcon.svelte';

	let { imageUrl, albumName } = $props<{
		imageUrl: string | undefined;
		albumName: string;
	}>();
</script>

<div class="relative w-full aspect-square mb-6 rounded-xl overflow-hidden shadow-lg border border-border/20 group cursor-pointer">
	{#if imageUrl}
		<img
			src={imageUrl}
			alt={albumName}
			class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
		/>
	{/if}

	<!-- Hover Overlay -->
	<div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
		<div class="bg-white/30 rounded-full p-4 mb-2 transform scale-90 group-hover:scale-100 transition-transform duration-300">
			<PlayIcon class="h-10 w-10 text-white" />
		</div>
		<span class="text-white font-bold text-sm tracking-wider uppercase">
			play preview
		</span>
	</div>
</div>
