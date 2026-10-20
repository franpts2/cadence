<script lang="ts">
    import { ExportIcon, ImportIcon } from '$lib';
	import { getCalendarState } from '../state/calendar-state.svelte';
	const cal = getCalendarState();
</script>

<!-- Floating on desktop; on touch these shrink to icon-only targets and the
     calendar reserves a matching strip at the bottom so no day cell sits under
     them. Gated by pointer type, not width — a landscape phone is still touch. -->
<div class="fixed bottom-[calc(0.75rem+var(--safe-inset-bottom))] right-3 flex flex-row gap-2 z-40 pointer-fine:right-6 pointer-fine:gap-3">
	<button
		onclick={() => cal.openImport()}
		aria-label="Import playlist"
		title="Import Playlist"
		class="flex items-center justify-center gap-2 h-11 w-11 px-0 bg-surface hover:bg-surface-hover border border-border text-text rounded-full shadow-md group pointer-fine:h-auto pointer-fine:w-auto pointer-fine:px-4 pointer-fine:py-2.5"
	>
		<ImportIcon class="w-[18px] h-[18px] text-text-muted group-hover:text-text transition-colors" />
		<span class="hidden pointer-fine:inline text-sm font-medium pr-1">Import</span>
	</button>

	<button
		onclick={() => cal.openExport()}
		aria-label="Export playlist"
		title="Export Playlist"
		class="flex items-center justify-center gap-2 h-11 w-11 px-0 bg-surface hover:bg-surface-hover border border-border text-text rounded-full shadow-md group pointer-fine:h-auto pointer-fine:w-auto pointer-fine:px-4 pointer-fine:py-2.5"
	>
		<ExportIcon class="w-[18px] h-[18px] text-text-muted group-hover:text-text transition-colors" />
		<span class="hidden pointer-fine:inline text-sm font-medium pr-1">Export</span>
	</button>
</div>
