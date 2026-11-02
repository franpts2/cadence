<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	import type { Session } from "@auth/sveltekit";
	import SpotifyIcon from './icons/SpotifyIcon.svelte';

	let {
		session,
		spotifyConnected = false
	}: { session: Session | null | undefined; spotifyConnected?: boolean } = $props();

	let connecting = $state(false);

	async function connectSpotify() {
		if (connecting) return;
		connecting = true;
		try {
			// Links Spotify to the signed-in account; it is optional and only
			// unlocks private playlists and playlist export.
			await signIn('spotify', { redirectTo: '/calendar' });
		} catch {
			connecting = false;
		}
	}
</script>

<div class="flex items-center justify-end gap-2 md:gap-4 order-2 md:order-3">
	{#if session?.user}
		{#if !spotifyConnected}
			<button
				type="button"
				onclick={connectSpotify}
				disabled={connecting}
				aria-label="Connect Spotify"
				title="Connect Spotify to import private playlists and export your calendar"
				class="inline-flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 bg-surface hover:bg-surface-hover border border-border text-text-muted hover:text-text rounded-md transition-colors text-xs md:text-sm font-medium disabled:opacity-60"
			>
				<SpotifyIcon class="h-3.5 w-3.5 md:h-4 md:w-4" />
				<span class="hidden lg:inline">{connecting ? 'Connecting…' : 'Connect Spotify'}</span>
			</button>
		{/if}
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
			onclick={() => signIn('google')}
			class="px-4 py-1.5 md:px-6 md:py-2 bg-text hover:bg-white text-bg font-bold rounded-full transition-colors text-xs md:text-sm"
		>
			Log in
		</button>
	{/if}
</div>
