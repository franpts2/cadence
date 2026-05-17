<script lang="ts">
	let { imageUrl, albumName } = $props<{
		imageUrl: string | undefined;
		albumName: string;
	}>();
</script>

<div class="w-full aspect-square mb-6 rounded-xl overflow-hidden shadow-lg border border-border/20">
	{#if imageUrl}
		<img
			src={imageUrl}
			alt={albumName}
			class="w-full h-full object-cover"
		/>
	{/if}
</div>
