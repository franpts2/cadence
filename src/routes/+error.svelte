<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
	<h1 class="text-6xl font-bold text-zinc-100 mb-4">{page.status}</h1>
	<p class="text-xl text-zinc-400 mb-8 max-w-md">
		{page.error?.message || "Something went wrong on our end. We're looking into it."}
	</p>
	<a 
		href="/" 
		class="px-6 py-2 bg-zinc-100 text-zinc-950 font-bold rounded-full hover:bg-zinc-300 transition-colors"
	>
		Go back home
	</a>
</div>
