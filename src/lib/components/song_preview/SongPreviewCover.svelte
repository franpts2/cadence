<script lang="ts">
	let { imageUrl, albumName } = $props<{
		imageUrl: string | undefined;
		albumName: string;
	}>();
</script>

<div class="relative w-full max-w-[13rem] sm:max-w-none mx-auto aspect-square mb-6 rounded-xl overflow-hidden shadow-lg border border-border/20">
	{#if imageUrl}
		<img
			src={imageUrl}
			alt={albumName}
			draggable="false"
			class="w-full h-full object-cover"
		/>
	{/if}
</div>
