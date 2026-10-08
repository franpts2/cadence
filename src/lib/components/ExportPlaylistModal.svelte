<script lang="ts">
	import Modal from './ui/Modal.svelte';
	import Select from './ui/Select.svelte';
	import Alert from './ui/Alert.svelte';
	import NumberInput from './ui/NumberInput.svelte';
	import LoadingIndicator from './ui/LoadingIndicator.svelte';
	import { getCalendarState, MONTHS } from '$lib';
	import { fade } from 'svelte/transition';

	const cal = getCalendarState();

	let exportType = $state<'monthly' | 'yearly' | 'all'>('monthly');
	let year = $state(cal.viewDate.getFullYear());
	let month = $state(cal.viewDate.getMonth());
	let isExporting = $state(false);
	let exportedUrl = $state<string | null>(null);

	const exportTypeOptions = [
		{ value: 'monthly', label: 'Monthly' },
		{ value: 'yearly', label: 'Yearly' },
		{ value: 'all', label: 'All Time' }
	];

	const monthOptions = MONTHS.map((m, i) => ({ value: i, label: m }));

	function reset() {
		exportType = 'monthly';
		year = cal.viewDate.getFullYear();
		month = cal.viewDate.getMonth();
		exportedUrl = null;
	}

	async function handleExport(e: SubmitEvent) {
		e.preventDefault();

		if (isExporting) return;

		isExporting = true;

		try {
			const payload: Record<string, unknown> = { exportType };

			if (exportType === 'monthly' || exportType === 'yearly') {
				payload.year = year;
			}
			if (exportType === 'monthly') {
				payload.month = month;
			}

			const response = await fetch('/api/songs/export', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.code === 'AUTH_EXPIRED') {
					cal.addToast(data.error || 'Spotify session expired. Please log in again.', 'error');
				} else {
					cal.addToast(data.error || 'Failed to export playlist', 'error');
				}
				return;
			}

			exportedUrl = data.playlistUrl;
			cal.addToast(`Exported ${data.count} songs to "${data.playlistName}"`, 'success');
		} catch (err) {
			console.error('Export error:', err);
			cal.addToast('An unexpected error occurred during export.', 'error');
		} finally {
			isExporting = false;
		}
	}

	function handleClose() {
		cal.closeExport();
		setTimeout(reset, 200);
	}
</script>

<Modal isOpen={cal.isExportOpen} onClose={handleClose}>
	{#if isExporting}
		<LoadingIndicator />
	{/if}

	<h2 class="text-2xl font-semibold text-text mb-2">Export Playlist</h2>
	<p class="text-sm text-text-muted mb-6">
		Create a private Spotify playlist from your calendar entries.
	</p>

	{#if exportedUrl}
		<div class="space-y-4" in:fade={{ duration: 150 }}>
			<Alert title="Export Complete" variant="success">
				<p>Your playlist was created successfully on Spotify.</p>
			</Alert>

			<a
				href={exportedUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="block w-full px-4 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-bg font-bold rounded-xl transition-all text-center"
			>
				Open Playlist on Spotify
			</a>

			<button
				type="button"
				onclick={handleClose}
				class="w-full px-4 py-2.5 border border-border text-text-muted hover:text-text hover:bg-surface-hover rounded-xl transition-all font-medium"
			>
				Close
			</button>
		</div>
	{:else}
		<form onsubmit={handleExport} class="w-full space-y-4 text-left">
			<div class={isExporting ? 'opacity-50 pointer-events-none' : ''}>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="export-type" class="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 ml-1">
							Export Type
						</label>
						<Select id="export-type" bind:value={exportType} options={exportTypeOptions} />
					</div>
					{#if exportType !== 'all'}
						<div>
							<label for="export-year" class="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 ml-1">
								Year
							</label>
							<NumberInput id="export-year" bind:value={year} min={2000} max={2100} />
						</div>
					{/if}
				</div>

				{#if exportType === 'monthly'}
					<div transition:fade={{ duration: 150 }}>
						<label for="export-month" class="block text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 ml-1">
							Month
						</label>
						<Select id="export-month" bind:value={month} options={monthOptions} />
					</div>
				{/if}

				<div>
					<Alert title="Important Note" variant="info">
						<p>
							A <strong>private</strong> playlist will be created in your Spotify account. Songs are ordered by date, from oldest to newest.
						</p>
						<p class="mt-2">
							If this is your first export, you may be asked to log in again to grant playlist creation permission.
						</p>
					</Alert>
				</div>
			</div>

			<div class="pt-2 flex gap-3">
				<button
					type="button"
					onclick={handleClose}
					disabled={isExporting}
					class="flex-1 px-4 py-2.5 border border-border text-text-muted hover:text-text hover:bg-surface-hover rounded-xl transition-all font-medium disabled:opacity-50"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={isExporting}
					class="flex-1 px-4 py-2.5 bg-text text-bg hover:bg-white rounded-xl transition-all font-bold disabled:opacity-50"
				>
					{isExporting ? 'Exporting...' : 'Export Playlist'}
				</button>
			</div>
		</form>
	{/if}
</Modal>
