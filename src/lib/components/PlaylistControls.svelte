<script lang="ts">
    import { ExportIcon, ImportIcon } from '$lib';
	import { getCalendarState } from '../state/calendar-state.svelte';
	const cal = getCalendarState();
</script>

<div class="fixed bottom-[calc(1.5rem+var(--safe-inset-bottom))] right-6 flex flex-row gap-3 z-40">
	<button
		onclick={() => cal.openImport()}
		class="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface-hover border border-border text-text rounded-full shadow-lg group"
		title="Import Playlist"
	>
		<ImportIcon class="w-5 h-5 text-text-muted group-hover:text-text transition-colors" />
		<span class="text-sm font-medium pr-1">Import</span>
	</button>

	<button
		class="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface-hover border border-border text-text rounded-full shadow-lg group"
		title="Export Playlist"
	>
		<ExportIcon class="w-5 h-5 text-text-muted group-hover:text-text transition-colors" />
		<span class="text-sm font-medium pr-1">Export</span>
	</button>
</div>

