<script lang="ts">
	import Calendar from '$lib/Calendar.svelte';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/state';

	const session = $derived(page.data.session);
</script>

<div class="h-screen w-screen overflow-hidden bg-zinc-950 flex flex-col">
	<div class="p-4 flex justify-end items-center gap-4 bg-zinc-900 border-b border-zinc-800">
		{#if session?.user}
			<span class="text-zinc-100">Hi, {session.user.name}!</span>
			<button
				onclick={() => signOut()}
				class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md transition-colors text-sm"
			>
				Log out
			</button>
		{:else}
			<span class="text-zinc-400">Not logged in</span>
			<button
				onclick={() => signIn('spotify')}
				class="px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-zinc-950 font-bold rounded-full transition-colors text-sm"
			>
				Log in to Spotify
			</button>
		{/if}
	</div>

	<div class="flex-1 overflow-hidden">
		<Calendar />
	</div>
</div>
