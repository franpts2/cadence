import { getContext, setContext } from 'svelte';
import type { Song, Toast, ToastType } from '../types/index';
import { getDateKey, MONTHS } from '../utils/date';

export class CalendarState {
	today = new Date();
	viewDate = $state(new Date(this.today.getFullYear(), this.today.getMonth(), 1));
	selectedDate = $state(this.today);
	
	// Song storage: key is "YYYY-MM-DD"
	songsPerDay = $state<Record<string, Song>>({});
	
	// Cache: keep track of which YYYY-MM have been loaded
	loadedMonths = new Set<string>();
	
	// UI State
	isLoading = $state(false);
	toasts = $state<Toast[]>([]);
	
	// Modal state
	isSearchOpen = $state(false);
	isImportOpen = $state(false);
	searchingForDate = $state<Date | null>(null);
	previewingSong = $state<Song | null>(null);

	// Drag state
	draggingSong = $state<Song | null>(null);
	draggingFromDay = $state<number | null>(null);
	
	// Pending move state
	pendingMove = $state<{ fromDay: number; toDay: number } | null>(null);
	isMoveConfirmOpen = $state(false);

	// Navigation feedback state
	navTargetDate = $state<Date | null>(null);
	private navTimeout: ReturnType<typeof setTimeout> | null = null;
	private navCancelTimeout: ReturnType<typeof setTimeout> | null = null;
	private readonly NAV_DELAY = 1200;

	private lastNavTime = 0;
	private navCooldown = 500;

	monthLabel = $derived(MONTHS[this.viewDate.getMonth()]);
	yearLabel = $derived(this.viewDate.getFullYear());

	constructor(initialSongs: Record<string, Song> = {}) {
		this.songsPerDay = initialSongs;
		if (Object.keys(initialSongs).length > 0) {
			const key = `${this.today.getFullYear()}-${this.today.getMonth() + 1}`;
			this.loadedMonths.add(key);
		}
	}

	// Preview Logic
	openPreview = (song: Song) => {
		this.previewingSong = song;
	};

	closePreview = () => {
		this.previewingSong = null;
	};

	// Toast Logic
	addToast = (message: string, type: ToastType = 'info') => {
		// Prevent duplicate toasts with the same message
		if (this.toasts.some(t => t.message === message)) return;

		const id = crypto.randomUUID();
		this.toasts.push({ id, message, type });
		setTimeout(() => this.removeToast(id), 5000);
	};

	removeToast = (id: string) => {
		this.toasts = this.toasts.filter(t => t.id !== id);
	};

	prevMonth = () => {
		const now = Date.now();
		if (now - this.lastNavTime < this.navCooldown) return;
		this.lastNavTime = now;
		this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
	};

	nextMonth = () => {
		const now = Date.now();
		if (now - this.lastNavTime < this.navCooldown) return;
		this.lastNavTime = now;
		this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
	};

	startDelayedNav = (direction: 'prev' | 'next') => {
		// Clear any pending cancel
		if (this.navCancelTimeout) {
			clearTimeout(this.navCancelTimeout);
			this.navCancelTimeout = null;
		}

		// If already navigating to this direction, do nothing
		if (this.navTimeout && this.navTargetDate) {
			const isSameDirection = direction === 'prev' 
				? (this.navTargetDate.getMonth() < this.viewDate.getMonth() || (this.navTargetDate.getMonth() === 11 && this.viewDate.getMonth() === 0))
				: (this.navTargetDate.getMonth() > this.viewDate.getMonth() || (this.navTargetDate.getMonth() === 0 && this.viewDate.getMonth() === 11));
			
			if (isSameDirection) return;
		}

		this.cancelDelayedNav(true); // Cancel any current ones immediately

		const target = new Date(this.viewDate);
		if (direction === 'prev') {
			target.setMonth(target.getMonth() - 1);
		} else {
			target.setMonth(target.getMonth() + 1);
		}
		
		this.navTargetDate = target;
		this.navTimeout = setTimeout(() => {
			if (direction === 'prev') this.prevMonth();
			else this.nextMonth();
			this.cancelDelayedNav(true);
		}, this.NAV_DELAY);
	};

	cancelDelayedNav = (immediate = false) => {
		if (immediate) {
			if (this.navTimeout) {
				clearTimeout(this.navTimeout);
				this.navTimeout = null;
			}
			if (this.navCancelTimeout) {
				clearTimeout(this.navCancelTimeout);
				this.navCancelTimeout = null;
			}
			this.navTargetDate = null;
		} else {
			// Delay cancel to allow moving between cells
			if (this.navCancelTimeout) return;
			this.navCancelTimeout = setTimeout(() => {
				this.cancelDelayedNav(true);
			}, 100);
		}
	};

	goToToday = () => {
		this.viewDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
		this.selectedDate = this.today;
	};

	selectDate = (day: number) => {
		this.selectedDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
	};

	startSearchForDay = (day: number) => {
		const date = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
		this.openSearch(date);
	};

	getSongsForDay = (day: number) => {
		const date = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
		const song = this.songsPerDay[getDateKey(date)];
		return song ? [song] : [];
	};

	openSearch = (date: Date) => {
		this.searchingForDate = date;
		this.isSearchOpen = true;
	};

	closeSearch = () => {
		this.isSearchOpen = false;
		this.searchingForDate = null;
	};

	openImport = () => {
		this.isImportOpen = true;
	};

	closeImport = () => {
		this.isImportOpen = false;
	};

	loadSongs = async () => {
		const year = this.viewDate.getFullYear();
		const month = this.viewDate.getMonth() + 1;
		const cacheKey = `${year}-${month}`;

		if (this.loadedMonths.has(cacheKey)) return;

		this.isLoading = true;
		try {
			const response = await fetch(`/api/songs?year=${year}&month=${month}`);
			if (response.ok) {
				const dbSongs: any[] = await response.json();
				const mapped = this.mapDbSongsToRecord(dbSongs);
				this.songsPerDay = { ...this.songsPerDay, ...mapped };
				this.loadedMonths.add(cacheKey);
			} else {
				const data = await response.json();
				if (data.code === 'AUTH_EXPIRED') {
					this.addToast('Spotify session expired. Please log in again.', 'error');
				} else {
					this.addToast('Failed to load songs', 'error');
				}
			}
		} catch (err) {
			console.error('Failed to load songs:', err);
			this.addToast('Network error while loading songs', 'error');
		} finally {
			this.isLoading = false;
		}
	};

	mapDbSongsToRecord = (dbSongs: any[]): Record<string, Song> => {
		const mapped: Record<string, Song> = {};
		dbSongs.forEach((s) => {
			mapped[s.dateKey] = {
				id: s.songId,
				name: s.songName,
				artists: [{ name: s.artistName }],
				album: {
					name: s.albumName,
					images: s.albumImageUrl ? [{ url: s.albumImageUrl }] : []
				},
				duration_ms: 0
			};
		});
		return mapped;
	};

	addSongToDate = async (date: Date, song: Song) => {
		const dateKey = getDateKey(date);
		this.isLoading = true;
		
		try {
			const response = await fetch('/api/songs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ dateKey, song })
			});

			if (response.ok) {
				this.songsPerDay[dateKey] = song;
				this.addToast('Song saved to calendar', 'success');
			} else {
				const data = await response.json();
				this.addToast(data.error || 'Failed to save song', 'error');
			}
		} catch (err) {
			console.error('Failed to persist song:', err);
			this.addToast('Network error while saving', 'error');
		} finally {
			this.isLoading = false;
			this.closeSearch();
		}
	};

	removeSongFromDate = async (day: number) => {
		const date = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), day);
		const dateKey = getDateKey(date);
		this.isLoading = true;

		try {
			const response = await fetch(`/api/songs?dateKey=${dateKey}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				delete this.songsPerDay[dateKey];
				this.addToast('Song removed', 'info');
			} else {
				this.addToast('Failed to remove song', 'error');
			}
		} catch (err) {
			console.error('Failed to delete song:', err);
			this.addToast('Network error while removing', 'error');
		} finally {
			this.isLoading = false;
		}
	};

	moveSong = async (fromDay: number, toDay: number) => {
		if (fromDay === toDay) return;

		const toDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), toDay);
		const toKey = getDateKey(toDate);

		// If target is occupied, show confirmation
		if (this.songsPerDay[toKey]) {
			this.pendingMove = { fromDay, toDay };
			this.isMoveConfirmOpen = true;
			return;
		}

		await this.executeMove(fromDay, toDay);
	};

	confirmMove = async () => {
		if (this.pendingMove) {
			const { fromDay, toDay } = this.pendingMove;
			this.isMoveConfirmOpen = false;
			this.pendingMove = null;
			await this.executeMove(fromDay, toDay);
		}
	};

	cancelMove = () => {
		this.isMoveConfirmOpen = false;
		this.pendingMove = null;
	};

	private executeMove = async (fromDay: number, toDay: number) => {
		const fromDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), fromDay);
		const toDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), toDay);
		const fromKey = getDateKey(fromDate);
		const toKey = getDateKey(toDate);

		const song = this.songsPerDay[fromKey];
		if (!song) return;

		// Optimistic update
		const originalTargetSong = this.songsPerDay[toKey];
		this.songsPerDay[toKey] = song;
		delete this.songsPerDay[fromKey];

		try {
			const response = await fetch('/api/songs', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fromKey, toKey })
			});

			if (!response.ok) {
				// Revert on failure
				this.songsPerDay[fromKey] = song;
				if (originalTargetSong) {
					this.songsPerDay[toKey] = originalTargetSong;
				} else {
					delete this.songsPerDay[toKey];
				}
				this.addToast('Failed to move song', 'error');
			}
		} catch (err) {
			console.error('Failed to move song:', err);
			// Revert on error
			this.songsPerDay[fromKey] = song;
			if (originalTargetSong) {
				this.songsPerDay[toKey] = originalTargetSong;
			} else {
				delete this.songsPerDay[toKey];
			}
			this.addToast('Network error while moving', 'error');
		}
	};
}

const CALENDAR_KEY = Symbol('calendar');

export function setCalendarState(initialSongs?: Record<string, Song>) {
	return setContext(CALENDAR_KEY, new CalendarState(initialSongs));
}

export function getCalendarState() {
	return getContext<CalendarState>(CALENDAR_KEY);
}
