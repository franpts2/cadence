<script lang="ts">
	import { getCalendarState, toastSlide } from '$lib';
	import { flip } from 'svelte/animate';
	import ToastItem from './ToastItem.svelte';

	const cal = getCalendarState();
</script>

<div
	class="fixed top-[calc(0.5rem+var(--safe-inset-top))] left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-2 w-full max-w-xs pointer-events-none"
	role="region"
	aria-label="Notifications"
	aria-live="polite"
>
	{#each cal.toasts as toast (toast.id)}
		<div animate:flip={{ duration: 300 }} class="pointer-events-none">
			<div transition:toastSlide={{ duration: 400 }}>
				<ToastItem
					{toast}
					onDismiss={() => cal.removeToast(toast.id)}
					onPause={() => cal.pauseToast(toast.id)}
					onResume={() => cal.resumeToast(toast.id)}
				/>
			</div>
		</div>
	{/each}
</div>
