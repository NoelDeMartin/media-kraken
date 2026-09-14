import { describe, expect, it } from 'vitest';

import { isoDurationToMinutes, minutesToISODuration } from '@/lib/durations';

describe('durations helpers', () => {
    it('converts minutes to ISO 8601 duration', () => {
        expect(minutesToISODuration(136)).toBe('PT2H16M');
        expect(minutesToISODuration(120)).toBe('PT2H');
        expect(minutesToISODuration(60)).toBe('PT1H');
        expect(minutesToISODuration(45)).toBe('PT45M');
        expect(minutesToISODuration(0)).toBe('PT0M');
        expect(minutesToISODuration(90.4)).toBe('PT1H30M');
    });

    it('parses ISO 8601 duration to minutes', () => {
        expect(isoDurationToMinutes('PT136M')).toBe(136);
        expect(isoDurationToMinutes('PT2H16M')).toBe(136);
        expect(isoDurationToMinutes('PT1H')).toBe(60);
        expect(isoDurationToMinutes('PT45M')).toBe(45);
        expect(isoDurationToMinutes('P1DT2H')).toBe(26 * 60);
        expect(isoDurationToMinutes('')).toBeNull();
        expect(isoDurationToMinutes('PT')).toBeNull();
        expect(isoDurationToMinutes('invalid')).toBeNull();
    });
});
