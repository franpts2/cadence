import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CalendarState } from './calendar-state.svelte';

describe('CalendarState', () => {
	let state: CalendarState;

	beforeEach(() => {
		// Mock fetch globally for all tests
		global.fetch = vi.fn();
		state = new CalendarState();
	});

	it('should initialize with correct default view date', () => {
		const now = new Date();
		expect(state.viewDate.getMonth()).toBe(now.getMonth());
		expect(state.viewDate.getFullYear()).toBe(now.getFullYear());
	});

	it('should navigate to previous month correctly', () => {
		const initialMonth = state.viewDate.getMonth();
		state.prevMonth();
		
		let expectedMonth = initialMonth - 1;
		if (expectedMonth < 0) expectedMonth = 11;
		
		expect(state.viewDate.getMonth()).toBe(expectedMonth);
	});

	it('should navigate to next month correctly', () => {
		const initialMonth = state.viewDate.getMonth();
		state.nextMonth();
		
		let expectedMonth = initialMonth + 1;
		if (expectedMonth > 11) expectedMonth = 0;
		
		expect(state.viewDate.getMonth()).toBe(expectedMonth);
	});

	it('should add toasts correctly', () => {
		state.addToast('Test Message', 'success');
		expect(state.toasts).toHaveLength(1);
		expect(state.toasts[0].message).toBe('Test Message');
		expect(state.toasts[0].type).toBe('success');
	});

	it('should remove toasts correctly', () => {
		state.addToast('Test Message', 'success');
		const id = state.toasts[0].id;
		state.removeToast(id);
		expect(state.toasts).toHaveLength(0);
	});
});
