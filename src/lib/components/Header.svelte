<script lang="ts">
	import CalendarNav from "./calendar/CalendarNav.svelte";
	import { signIn, signOut } from '@auth/sveltekit/client';
	import type { Session } from "@auth/sveltekit";

	let { monthLabel, yearLabel, onPrev, onNext, onToday, session } = $props<{
		monthLabel: string;
		yearLabel: number;
		onPrev: () => void;
		onNext: () => void;
		onToday: () => void;
		session: Session | null | undefined;
	}>();
</script>

<header
	class="flex items-center justify-between px-8 py-4 border-b border-zinc-800 bg-zinc-950"
>
	<div class="flex items-center">
		<div class="flex items-center gap-4">
			<h1 class="text-2xl font-light tracking-tighter text-zinc-400">
				CADENCE
			</h1>
			<div class="h-5 w-px bg-zinc-800"></div>
			<h2 class="text-xl text-zinc-100 min-w-[150px]">
				{monthLabel} {yearLabel}
			</h2>
		</div>

		<CalendarNav {onPrev} {onNext} {onToday} />
	</div>

	<div class="flex items-center gap-4">
		{#if session?.user}
			<span class="text-sm text-zinc-400 italic">Hi, {session.user.name}</span>
			<button
				onclick={() => signOut()}
				class="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-md transition-colors text-xs font-medium"
			>
				Log out
			</button>
		{:else}
			<button
				onclick={() => signIn('spotify')}
				class="px-4 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-zinc-950 font-bold rounded-full transition-colors text-xs"
			>
				Log in to Spotify
			</button>
		{/if}
	</div>
</header>
