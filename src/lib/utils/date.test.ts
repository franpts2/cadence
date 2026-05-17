import { describe, it, expect } from 'vitest';
import { getDaysInMonth, getStartDayOfMonth, getDateKey, isSameDay } from './date';

describe('date utilities', () => {
	it('should return correct number of days in a month', () => {
		expect(getDaysInMonth(2024, 1)).toBe(29); // Leap year February
		expect(getDaysInMonth(2023, 1)).toBe(28); // Regular February
		expect(getDaysInMonth(2024, 0)).toBe(31); // January
	});

	it('should return correct start day of month', () => {
		// May 1st, 2026 is a Friday (5)
		expect(getStartDayOfMonth(2026, 4)).toBe(5);
	});

	it('should format date key correctly', () => {
		const date = new Date(2026, 4, 16);
		expect(getDateKey(date)).toBe('2026-05-16');
	});

	it('should correctly identify same day', () => {
		const d1 = new Date(2026, 4, 16);
		const d2 = new Date(2026, 4, 16);
		const d3 = new Date(2026, 4, 17);
		
		expect(isSameDay(d1, d2)).toBe(true);
		expect(isSameDay(d1, d3)).toBe(false);
	});
});
