export interface Song {
	id: string;
	name: string;
	artists: { name: string }[];
	album: {
		name: string;
		images: { url: string }[];
	};
	duration_ms: number;
}

export class CalendarState {
	today = new Date();
	viewDate = $state(new Date(this.today.getFullYear(), this.today.getMonth(), 1));
	selectedDate = $state(this.today);
	
	// Song storage: key is "YYYY-MM-DD"
	songsPerDay = $state<Record<string, Song[]>>({});
	
	// Modal state
	isSearchOpen = $state(false);
	searchingForDate = $state<Date | null>(null);

	months = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];

	monthLabel = $derived(this.months[this.viewDate.getMonth()]);
	yearLabel = $derived(this.viewDate.getFullYear());

	prevMonth = () => {
		this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
	};

	nextMonth = () => {
		this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
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
		return this.getSongsForDate(date);
	};

	openSearch = (date: Date) => {
		this.searchingForDate = date;
		this.isSearchOpen = true;
	};

	closeSearch = () => {
		this.isSearchOpen = false;
		this.searchingForDate = null;
	};

	addSongToDate = (date: Date, song: Song) => {
		const dateKey = this.getDateKey(date);
		if (!this.songsPerDay[dateKey]) {
			this.songsPerDay[dateKey] = [];
		}
		this.songsPerDay[dateKey].push(song);
		this.closeSearch();
	};

	getDateKey = (date: Date) => {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	};

	getSongsForDate = (date: Date) => {
		return this.songsPerDay[this.getDateKey(date)] || [];
	};
}
