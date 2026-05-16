<script lang="ts">
	import CalendarNav from "./calendar/CalendarNav.svelte";
	import UserMenu from "./UserMenu.svelte";
	import type { Session } from "@auth/sveltekit";
	import { getCalendarState } from "$lib";

	let { session } = $props<{
		session: Session | null | undefined;
	}>();

	const cal = getCalendarState();
</script>

<header
	class="grid grid-cols-2 items-center gap-y-4 px-4 py-4 border-b border-zinc-800 bg-zinc-950 md:flex md:justify-between md:px-8"
>
	<div class="flex items-center gap-3 md:gap-4 order-1">
		<h1 class="text-xl font-light tracking-tighter text-zinc-400 md:text-2xl">
			CADENCE
		</h1>
		<div class="hidden h-5 w-px bg-zinc-800 md:block"></div>
		<h2 class="hidden text-lg text-zinc-100 min-w-[120px] md:block lg:text-xl lg:min-w-[150px]">
			{cal.monthLabel} {cal.yearLabel}
		</h2>
	</div>

	<div class="flex items-center justify-center col-span-2 order-3 md:order-2 md:col-auto md:ml-0 md:mr-auto">
		<div class="flex flex-col items-center gap-2 md:flex-row md:gap-0">
			<h2 class="text-xl font-medium text-zinc-100 md:hidden">
				{cal.monthLabel} {cal.yearLabel}
			</h2>
			<CalendarNav />
		</div>
	</div>

	<UserMenu {session} />
</header>
