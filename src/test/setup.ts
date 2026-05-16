import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('$app/state', () => ({
	page: {
		data: {
			session: null
		}
	}
}));
