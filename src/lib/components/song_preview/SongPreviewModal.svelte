<script lang="ts">
	import type { Song } from '$lib/types';
	import { TrashIcon, getCalendarState, getDaysInMonth, DAYS_OF_WEEK } from '$lib';
	import Modal from '../ui/Modal.svelte';
	import SongPreviewCover from './SongPreviewCover.svelte';
	import SongPreviewDetails from './SongPreviewDetails.svelte';

	let {
		song,
		isOpen,
		onClose,
		onDelete,
		day = null,
		onMove
	}: {
		song: Song | null;
		isOpen: boolean;
		onClose: () => void;
		onDelete?: () => void;
		day?: number | null;
		onMove?: (toDay: number) => void;
	} = $props();

	const cal = getCalendarState();

	// The state clears `song` the moment the sheet closes. Hold the last song so
	// the sheet keeps its full height while it slides out instead of collapsing.
	let visibleSong = $state<Song | null>(null);
	$effect.pre(() => {
		if (song) visibleSong = song;
	});

	// Touch fallback for moving a song: long-press drag is invisible to anyone
	// who has not been told about it, so the sheet offers an explicit action.
	let isMovePickerOpen = $state(false);
	let moveTarget = $state<number | null>(null);

	const year = $derived(cal.viewDate.getFullYear());
	const month = $derived(cal.viewDate.getMonth());
	const daysInMonth = $derived(getDaysInMonth(year, month));
	const days = $derived(Array.from({ length: daysInMonth }, (_, i) => i + 1));

	$effect(() => {
		if (!isOpen) {
			isMovePickerOpen = false;
			moveTarget = null;
		}
	});

	function confirmMove() {
		if (moveTarget === null || moveTarget === day || !onMove) return;
		onMove(moveTarget);
		isMovePickerOpen = false;
		moveTarget = null;
	}
</script>

<Modal {isOpen} {onClose}>
	{#if visibleSong}
		<SongPreviewCover
			imageUrl={visibleSong.album.images[0]?.url}
			albumName={visibleSong.album.name}
		/>

		<SongPreviewDetails
			name={visibleSong.name}
			artistName={visibleSong.artists[0]?.name ?? 'Unknown Artist'}
			albumName={visibleSong.album.name}
		/>

		<!-- Touch only: drag-to-move is not discoverable without a pointer hint,
		     so there is an explicit day picker here. -->
		{#if onMove && day !== null}
			<div class="pointer-fine:hidden w-full mt-6 pt-5 border-t border-border/60">
				{#if !isMovePickerOpen}
					<button
						type="button"
						onclick={() => (isMovePickerOpen = true)}
						class="w-full min-h-11 rounded-xl border border-border text-text-muted hover:text-text hover:bg-surface-hover transition-colors font-medium text-sm"
					>
						Move to another day
					</button>
				{:else}
					<label for="move-target-day" class="sr-only">Move to day</label>
					<div class="flex items-stretch gap-2">
						<select
							id="move-target-day"
							bind:value={moveTarget}
							class="min-w-0 flex-1 min-h-11 rounded-xl bg-bg border border-border px-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50"
						>
							<option value={null} disabled>Choose a day</option>
							{#each days as d}
								<option value={d} disabled={d === day}>
									{d} — {DAYS_OF_WEEK[new Date(year, month, d).getDay()]}
									{cal.getSongsForDay(d).length > 0 ? ' · has song' : ''}
								</option>
							{/each}
						</select>
						<button
							type="button"
							onclick={confirmMove}
							disabled={moveTarget === null || moveTarget === day}
							class="min-h-11 px-4 rounded-xl bg-text text-bg font-semibold text-sm disabled:opacity-40 transition-opacity"
						>
							Move
						</button>
					</div>
					<button
						type="button"
						onclick={() => {
							isMovePickerOpen = false;
							moveTarget = null;
						}}
						class="mt-2 min-h-11 w-full rounded-xl text-text-dim hover:text-text-muted text-xs font-medium transition-colors"
					>
						Cancel
					</button>
				{/if}
			</div>
		{/if}

		<!-- Touch only: the day grid offers no delete affordance on touch, so it lives here -->
		{#if onDelete}
			<button
				onclick={() => onDelete()}
				class="pointer-fine:hidden absolute z-20 bottom-[calc(0.75rem+var(--safe-inset-bottom))] right-3 sm:bottom-4 sm:right-4 p-3 rounded-full text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors outline-none"
				aria-label="Remove song"
			>
				<TrashIcon class="h-5 w-5" />
			</button>
		{/if}
	{/if}
</Modal>
