<script lang="ts">
	import CalendarNav from "./calendar/CalendarNav.svelte";
	import UserMenu from "./UserMenu.svelte";
	import type { Session } from "@auth/sveltekit";
	import { getCalendarState, ShareIcon } from "$lib";

	let { session } = $props<{
		session: Session | null | undefined;
	}>();

	const cal = getCalendarState();
</script>

<header
	class="grid grid-cols-2 items-center gap-y-2 px-4 pt-[calc(0.75rem+var(--safe-inset-top))] pb-2 border-b border-border bg-bg md:flex md:justify-between md:gap-x-3 md:gap-y-0 md:px-8 md:py-4"
>
	<div class="flex items-center gap-3 md:gap-4 order-1">
		<h1 class="text-lg font-light tracking-tighter text-text-muted sm:text-xl md:text-2xl">
			CADENCE
		</h1>
		<div class="hidden h-5 w-px bg-border md:block"></div>
		<h2
			class="hidden text-lg text-text whitespace-nowrap md:block md:min-w-[6rem] lg:text-xl lg:min-w-[6.5rem]"
		>
			{cal.monthLabel} {cal.yearLabel}
		</h2>
	</div>

	<div class="flex items-center justify-center gap-3 col-span-2 order-3 md:order-2 md:col-auto md:mr-auto">
		<p class="text-lg font-medium text-text whitespace-nowrap md:hidden">
			{cal.monthLabel} {cal.yearLabel}
		</p>
		<CalendarNav />
		<button
			onclick={cal.openShare}
			class="flex h-11 w-11 items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-hover transition-colors md:h-8 md:w-8 md:rounded-md"
			aria-label="Share this month"
			title="Share this month"
		>
			<ShareIcon class="h-[18px] w-[18px] md:h-4 md:w-4" />
		</button>
	</div>

	<UserMenu {session} />
</header>
