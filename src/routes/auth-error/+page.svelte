<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { page } from '$app/state';
	import GoogleIcon from '$lib/components/icons/GoogleIcon.svelte';

	let { data } = $props();
	let signingIn = $state(false);
	const signedIn = $derived(Boolean(page.data.session?.user));

	const messages: Record<string, { title: string; body: string }> = {
		AccessDenied: {
			title: 'Access was denied',
			body: 'Cadence needs permission to connect to your account. You can try again and accept the permissions on the next screen.'
		},
		Verification: {
			title: 'That link has expired',
			body: 'The sign-in link was already used or is no longer valid. Start again below.'
		},
		OAuthAccountNotLinked: {
			title: 'This account is already linked',
			body: 'That Spotify account is already connected to a different Cadence account.'
		},
		OAuthCallbackError: {
			title: "Spotify couldn't finish the connection",
			body: 'Spotify returned an error before we could sign you in. Trying again usually fixes it.'
		},
		MissingCSRF: {
			title: 'Your session expired',
			body: 'The sign-in form was stale. Start again below — it only takes a second.'
		}
	};

	const message = $derived(
		messages[data.error] ?? {
			title: "Sign-in didn't finish",
			body: 'Something interrupted the flow before we could finish. This usually happens when the login opens in a different browser or app than the one you started in — for example inside Instagram or WhatsApp — or when the page stays open for a long time. Trying again usually fixes it.'
		}
	);

	async function retry() {
		if (signingIn) return;
		signingIn = true;
		try {
			await signIn('google', { redirectTo: '/calendar' });
		} catch {
			signingIn = false;
		}
	}
</script>

<svelte:head>
	<title>Sign-in problem · Cadence</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-dvh w-full flex-col bg-bg text-text">
	<header class="px-6 pt-[calc(1.25rem+var(--safe-inset-top))] sm:px-10">
		<a href="/" class="text-sm font-light tracking-[0.2em] text-text-muted">CADENCE</a>
	</header>

	<main class="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
		<h1 class="max-w-md text-3xl font-light leading-tight tracking-tight sm:text-4xl">
			{message.title}
		</h1>

		<p class="mt-5 max-w-md text-sm leading-relaxed text-text-muted sm:text-base">
			{message.body}
		</p>

		<div class="mt-9 flex flex-col items-center gap-4">
			{#if signedIn}
				<a
					href="/calendar"
					class="inline-flex items-center gap-2.5 rounded-full bg-text px-6 py-3 text-sm font-semibold text-bg hover:bg-white"
				>
					Back to calendar
				</a>
			{:else}
				<button
					type="button"
					onclick={retry}
					disabled={signingIn}
					aria-busy={signingIn}
					class="inline-flex items-center gap-2.5 rounded-full bg-text px-6 py-3 text-sm font-semibold text-bg hover:bg-white disabled:cursor-default disabled:opacity-80"
				>
					{#if signingIn}
						<span
							class="h-4 w-4 animate-spin rounded-full border-2 border-bg/40 border-t-bg"
							aria-hidden="true"
						></span>
						Connecting…
					{:else}
						<GoogleIcon class="h-4 w-4" />
						Try again with Google
					{/if}
				</button>
			{/if}

			<a href="/" class="text-xs text-text-dim underline-offset-4 hover:text-text-muted hover:underline">
				Back to home
			</a>
		</div>

		<p class="mt-12 max-w-sm text-[11px] leading-relaxed text-text-subtle">
			Tip: open cadence.franciscapt.dev directly in Chrome, Safari, Firefox or Edge — not
			inside another app's built-in browser.
		</p>

		<p class="mt-4 text-[10px] uppercase tracking-[0.18em] text-text-subtle">
			Error code: {data.error}
		</p>
	</main>
</div>
