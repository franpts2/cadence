<script lang="ts">
	import Modal from './ui/Modal.svelte';
	import { getCalendarState, WarningIcon } from '$lib';

	const cal = getCalendarState();
</script>

<Modal isOpen={cal.isMoveConfirmOpen} onClose={() => cal.cancelMove()}>
	<div class="flex flex-col items-center gap-4">
		<div class="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-error">
			<WarningIcon class="h-6 w-6 text-red-500" />
		</div>
		
		<div class="flex flex-col gap-1">
			<h2 class="text-lg font-bold text-text">Override Song?</h2>
			<p class="text-sm text-text-muted px-4">
				There is already a song scheduled for this day. Moving this song will replace it.
			</p>
		</div>

		<div class="flex w-full gap-3 mt-4">
			<button
				onclick={() => cal.cancelMove()}
				class="flex-1 px-4 py-2.5 rounded-xl border border-border text-text-muted hover:text-text hover:bg-surface-hover transition-colors font-medium text-sm"
			>
				Cancel
			</button>
			<button
				onclick={() => cal.confirmMove()}
				class="flex-1 px-4 py-2.5 rounded-xl text-bg bg-red-500 hover:bg-red-700 transition-colors font-bold text-sm shadow-lg shadow-error/20"
			>
				Override
			</button>
		</div>
	</div>
</Modal>
