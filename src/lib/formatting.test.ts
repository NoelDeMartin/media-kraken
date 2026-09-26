import { describe, expect, it } from 'vitest';

import { formatDuration } from './formatting';

describe('formatting helpers', () => {
    it('formats duration', async () => {
        expect(formatDuration({ minutes: 0 })).toBe('0m');
        expect(formatDuration({ minutes: 45 })).toBe('45m');
        expect(formatDuration({ minutes: 60 })).toBe('1h');
        expect(formatDuration({ minutes: 136 })).toBe('2h 16m');
    });
});
