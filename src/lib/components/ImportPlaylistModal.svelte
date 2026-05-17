<script lang="ts">
	import Modal from './ui/Modal.svelte';
	import Select from './ui/Select.svelte';
	import Alert from './ui/Alert.svelte';
	import NumberInput from './ui/NumberInput.svelte';
	import LoadingIndicator from './ui/LoadingIndicator.svelte';
	import { getCalendarState, MONTHS } from '$lib';
	import { fade } from 'svelte/transition';

	const cal = getCalendarState();

	let playlistUrl = $state('');
	let importType = $state<'monthly' | 'yearly'>('monthly');
	let year = $state(cal.viewDate.getFullYear());
	let month = $state(cal.viewDate.getMonth());
	let isImporting = $state(false);

	const importTypeOptions = [
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'yearly', label: 'Yearly' }
	];

	const monthOptions = MONTHS.map((m, i) => ({ value: i, label: m }));

	async function handleImport(e: SubmitEvent) {
		e.preventDefault();
		
		if (isImporting) return;
		
		isImporting = true;
		
		try {
			const response = await fetch('/api/songs/import', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					playlistUrl,
					importType,
					year,
					month
				})
			});

			const data = await response.json();

			if (!response.ok) {
				cal.addToast(data.error || 'Failed to import playlist', 'error');
				return;
			}

			let successMessage = `Successfully imported ${data.count} songs to your ${data.period}.`;
			if (data.skipped > 0) {
				successMessage += ` ${data.skipped} songs were skipped as they exceeded the ${data.period}'s days.`;
			}

			cal.addToast(successMessage, 'success');
			
			// Refresh calendar cache
			if (importType === 'monthly') {
				cal.loadedMonths.delete(`${year}-${month + 1}`);
				if (year === cal.viewDate.getFullYear() && month === cal.viewDate.getMonth()) {
					await cal.loadSongs();
				}
			} else {
				// Yearly: invalidate all months for that year
				for (let m = 1; m <= 12; m++) {
					cal.loadedMonths.delete(`${year}-${m}`);
				}
				if (year === cal.viewDate.getFullYear()) {
					await cal.loadSongs();
				}
			}

			cal.closeImport();
		} catch (err) {
			console.error('Import error:', err);
			cal.addToast('An unexpected error occurred during import.', 'error');
		} finally {
			isImporting = false;
		}
	}
</script>

<Modal isOpen={cal.isImportOpen} onClose={() => cal.closeImport()}>
	{#if isImporting}
		<LoadingIndicator />
	{/if}

	<h2 class="text-2xl font-semibold text-text mb-2">Import Playlist</h2>
	<p class="text-sm text-text-muted mb-6">
		Bring your Spotify playlist songs directly into your calendar.
	</p>

	<form onsubmit={handleImport} class="w-full space-y-4 text-left">
		<div class={isImporting ? 'opacity-50 pointer-events-none' : ''}>
			<div>
				<label for="playlist-url" class="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 ml-1">
					Spotify Playlist URL
				</label>
				<input
					id="playlist-url"
					type="url"
					bind:value={playlistUrl}
					placeholder="https://open.spotify.com/playlist/..."
					required
					class="w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 transition-all"
				/>
			</div>

			<div class="grid grid-cols-2 gap-4 mt-4">
				<div>
					<label for="import-type" class="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 ml-1">
						Import Type
					</label>
					<Select id="import-type" bind:value={importType} options={importTypeOptions} />
				</div>
				<div>
					<label for="import-year" class="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 ml-1">
						Year
					</label>
					<NumberInput id="import-year" bind:value={year} min={2000} max={2100} />
				</div>
			</div>

			{#if importType === 'monthly'}
				<div class="mt-4" transition:fade={{ duration: 150 }}>
					<label for="import-month" class="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 ml-1">
						Month
					</label>
					<Select id="import-month" bind:value={month} options={monthOptions} />
				</div>
			{/if}

			<div class="mt-4">
				<Alert title="Important Note" variant="error">
					<p>
						Songs will be added to your calendar starting from the first day of the {importType === 'monthly' ? 'month' : 'year'}. Each song will take up one day, following the order of your playlist.
					</p>
					<p class="mt-2 font-bold text-red-400">
						Warning: This will permanently replace any songs already scheduled during this period.
					</p>
				</Alert>
			</div>
		</div>

		<div class="pt-2 flex gap-3">
			<button
				type="button"
				onclick={() => cal.closeImport()}
				disabled={isImporting}
				class="flex-1 px-4 py-2.5 border border-border text-text-muted hover:text-text hover:bg-surface-hover rounded-xl transition-all font-medium disabled:opacity-50"
			>
				Cancel
			</button>
			<button
				type="submit"
				disabled={isImporting}
				class="flex-1 px-4 py-2.5 bg-text text-bg hover:bg-white rounded-xl transition-all font-bold disabled:opacity-50"
			>
				{isImporting ? 'Importing...' : 'Import Playlist'}
			</button>
		</div>
	</form>
</Modal>
