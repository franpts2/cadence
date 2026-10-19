<script lang="ts">
	import Modal from './ui/Modal.svelte';
	import { getCalendarState, TrashIcon, MONTHS } from '$lib';

	const cal = getCalendarState();

	// The confirmation restates what is about to be removed, so the song is read
	// back out of state rather than being passed in. This is read at render time
	// only — the month can't change while the confirmation is open.
	const song = $derived(
		cal.pendingDeleteDay === null
			? null
			: cal.getSongsForDay(cal.pendingDeleteDay)[0] ?? null
	);

	const dateLabel = $derived(
		cal.pendingDeleteDay === null
			? ''
			: `${MONTHS[cal.viewDate.getMonth()]} ${cal.pendingDeleteDay}, ${cal.viewDate.getFullYear()}`
	);

	// Focus the safe action so an errant Enter can't confirm a delete, and hand
	// focus back to the trigger on close when it is still mounted.
	function focusSafeAction(node: HTMLElement) {
		const previouslyFocused = document.activeElement;
		node.focus({ preventScroll: true });

		return {
			destroy() {
				if (
					previouslyFocused instanceof HTMLElement &&
					document.contains(previouslyFocused)
				) {
					previouslyFocused.focus({ preventScroll: true });
				}
			}
		};
	}
</script>

<Modal isOpen={cal.isDeleteConfirmOpen} onClose={() => cal.cancelDeleteSong()}>
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-song-title"
		class="flex flex-col items-center gap-4"
	>
		<div class="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
			<TrashIcon class="h-6 w-6 text-red-500" />
		</div>

		<div class="flex flex-col gap-1 w-full">
			<h2 id="delete-song-title" class="text-lg font-bold text-text">Remove Song?</h2>
			{#if song}
				<p class="text-sm font-medium text-text px-4 break-words">{song.name}</p>
			{/if}
			{#if dateLabel}
				<p class="text-xs text-text-dim">{dateLabel}</p>
			{/if}
		</div>

		<p class="text-sm text-text-muted px-4">
			This song will be removed from your calendar. You can add a new song to this day at any time.
		</p>

		<div class="flex w-full gap-3 mt-4">
			<button
				onclick={() => cal.cancelDeleteSong()}
				use:focusSafeAction
				class="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-muted hover:text-text hover:bg-surface-hover transition-colors font-medium text-sm"
			>
				Cancel
			</button>
			<button
				onclick={() => cal.confirmDeleteSong()}
				class="flex-1 px-4 py-2.5 rounded-xl text-bg bg-red-500 hover:bg-red-700 transition-colors font-bold text-sm shadow-lg"
			>
				Remove
			</button>
		</div>
	</div>
</Modal>
