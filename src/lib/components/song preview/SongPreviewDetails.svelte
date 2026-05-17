<script lang="ts">
	let { name, artistName, albumName } = $props<{
		name: string;
		artistName: string;
		albumName: string;
	}>();
</script>

<h2 class="text-xl font-bold text-text mb-2 line-clamp-2 px-4">
	{name}
</h2>

<p class="text-text-muted text-lg font-medium">
	{artistName}
</p>

<p class="text-text-dim text-sm mt-1 italic">
	{albumName}
</p>
