<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	import type { Session } from "@auth/sveltekit";

	let { session }: { session: Session | null | undefined } = $props();
</script>

<div class="flex items-center justify-end gap-2 md:gap-4 order-2 md:order-3">
	{#if session?.user}
		<div class="flex items-center gap-2 md:gap-3">
			{#if session.user.image}
				<img 
					src={session.user.image} 
					alt={session.user.name ?? 'User'} 
					class="w-7 h-7 md:w-8 md:h-8 rounded-full border border-border" 
				/>
			{/if}
			<span class="hidden text-sm text-text font-medium sm:block">{session.user.name}</span>
		</div>
		<button
			onclick={() => signOut()}
			class="px-3 py-1.5 md:px-4 md:py-2 bg-surface hover:bg-surface-hover border border-border text-accent-hover hover:text-text rounded-md transition-colors text-xs md:text-sm font-medium"
		>
			Log out
		</button>
	{:else}
		<button
			onclick={() => signIn('spotify')}
			class="px-4 py-1.5 md:px-6 md:py-2 bg-[#1DB954] hover:bg-[#1ed760] text-bg font-bold rounded-full transition-colors text-xs md:text-sm"
		>
			Log in to Spotify
		</button>
	{/if}
</div>
