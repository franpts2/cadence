<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import SpotifyIcon from '$lib/components/icons/SpotifyIcon.svelte';
	import MusicIcon from '$lib/components/icons/MusicIcon.svelte';

	let signingIn = $state(false);

	async function handleSignIn() {
		if (signingIn) return;
		signingIn = true;
		try {
			// Redirects to Spotify; on success the browser navigates away and the
			// loading state stays put. Only reset if the redirect itself failed.
			await signIn('spotify', { redirectTo: '/calendar' });
		} catch {
			signingIn = false;
		}
	}

	// A quiet miniature of the real calendar: four weeks, a few days filled.
	const weeks = [
		[1, 2, 3, 4, 5, 6, 7],
		[8, 9, 10, 11, 12, 13, 14],
		[15, 16, 17, 18, 19, 20, 21],
		[22, 23, 24, 25, 26, 27, 28]
	];
	const filled = new Set([4, 9, 13, 19, 24]);
	const today = 19;
</script>

<div class="relative flex min-h-dvh w-full flex-col bg-bg text-text">
	<header class="px-6 pt-[calc(1.25rem+var(--safe-inset-top))] sm:px-10">
		<span class="text-sm font-light tracking-[0.2em] text-text-muted">CADENCE</span>
	</header>

	<main
		class="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-10"
	>
		<h1
			class="reveal mt-6 max-w-2xl text-4xl font-light leading-[1.1] tracking-tight text-text sm:text-5xl md:text-6xl"
			style="--i: 1"
		>
			Track your life,<br class="hidden sm:block" />
			one song at a time.
		</h1>

		<p
			class="reveal mt-6 max-w-md text-sm leading-relaxed text-text-muted sm:text-base"
			style="--i: 2"
		>
			Pick a song each day and watch your year become a calendar of the moments that
			mattered.
		</p>

		<div class="reveal mt-10 flex flex-col items-center gap-3" style="--i: 3">
			<button
				type="button"
				onclick={handleSignIn}
				disabled={signingIn}
				aria-busy={signingIn}
				class="inline-flex items-center gap-2.5 rounded-full bg-[#1DB954] px-6 py-3 text-sm font-semibold text-bg hover:bg-[#1ed760] disabled:cursor-default disabled:opacity-80"
			>
				{#if signingIn}
					<span
						class="h-4 w-4 animate-spin rounded-full border-2 border-bg/40 border-t-bg"
						aria-hidden="true"
					></span>
					Connecting…
				{:else}
					<SpotifyIcon class="h-4 w-4" />
					Continue with Spotify
				{/if}
			</button>

			<p class="text-[11px] text-text-subtle">Free to use</p>
		</div>

		<!-- Quiet miniature of the calendar -->
		<div
			class="reveal mt-16 w-full max-w-xs border-l border-t border-border-dim"
			style="--i: 4"
			aria-hidden="true"
		>
			{#each weeks as week}
				<div class="grid grid-cols-7">
					{#each week as day}
						<div
							class="relative flex aspect-square items-center justify-center border-b border-r border-border-dim {day ===
							today
								? 'bg-surface'
								: ''}"
						>
							<span
								class="absolute left-1.5 top-1 text-[9px] leading-none {day === today
									? 'text-text-muted'
									: 'text-text-subtle'}"
							>
								{day}
							</span>
							{#if filled.has(day)}
								<MusicIcon class="h-3 w-3 text-text-dim" />
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</main>

	<footer
		class="px-6 pb-[calc(1.5rem+var(--safe-inset-bottom))] pt-8 text-center sm:px-10"
	>
		<p class="text-[10px] uppercase tracking-[0.2em] text-text-subtle">
			Powered by Spotify
		</p>
	</footer>
</div>

<style>
	/*
	 * Entrance: fade + a short rise, staggered 70ms apart down the page.
	 * Uses @starting-style so the markup stays server-rendered and fully
	 * readable without JS — the motion is purely an enhancement.
	 */
	.reveal {
		opacity: 1;
		transition-property: opacity, transform;
		transition-duration: 480ms;
		transition-timing-function: var(--ease-out);
		transition-delay: calc(var(--i, 0) * 70ms);

		@starting-style {
			opacity: 0;
		}
	}

	/* Keep the opacity cross-fade for reduced motion; drop the transform. */
	@media (prefers-reduced-motion: no-preference) {
		.reveal {
			@starting-style {
				opacity: 0;
				transform: translateY(10px);
			}
		}
	}
</style>
