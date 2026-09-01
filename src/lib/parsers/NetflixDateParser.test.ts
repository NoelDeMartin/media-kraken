import { describe, expect, it } from 'vitest';

import NetflixDateParser from './NetflixDateParser';

describe('NetflixDateParser', () => {
    it('parses US format (MM/DD/YY)', () => {
        const parser = NetflixDateParser.fromDates(['3/15/20', '4/2/20']);

        expect(parser).not.toBeNull();
        expect(parser?.parseDate('3/15/20')).toEqual(new Date('2020-03-15'));
        expect(parser?.parseDate('4/2/20')).toEqual(new Date('2020-04-02'));
    });

    it('parses European format (DD/MM/YY)', () => {
        const parser = NetflixDateParser.fromDates(['15/3/20', '2/4/20']);

        expect(parser).not.toBeNull();
        expect(parser?.parseDate('15/3/20')).toEqual(new Date('2020-03-15'));
        expect(parser?.parseDate('2/4/20')).toEqual(new Date('2020-04-02'));
    });

    it('handles European format when month variance is higher than day variance', () => {
        // Days are 15 and 20 (variance = 5), Months are 1 and 12 (variance = 11)
        const parser = NetflixDateParser.fromDates(['15/1/20', '20/12/20']);

        expect(parser).not.toBeNull();
        expect(parser?.parseDate('15/1/20')).toEqual(new Date('2020-01-15'));
        expect(parser?.parseDate('20/12/20')).toEqual(new Date('2020-12-20'));
    });

    it('parses 4-digit year European format (DD/MM/YYYY)', () => {
        const parser = NetflixDateParser.fromDates(['15/03/2024', '02/04/2024']);

        expect(parser).not.toBeNull();
        expect(parser?.parseDate('15/03/2024')).toEqual(new Date('2024-03-15'));
        expect(parser?.parseDate('02/04/2024')).toEqual(new Date('2024-04-02'));
    });

    it('parses ISO format (YYYY-MM-DD)', () => {
        const parser = NetflixDateParser.fromDates(['2024-03-15', '2024-04-02']);

        expect(parser).not.toBeNull();
        expect(parser?.parseDate('2024-03-15')).toEqual(new Date('2024-03-15'));
        expect(parser?.parseDate('2024-04-02')).toEqual(new Date('2024-04-02'));
    });

    it('parses German format with dot separator (DD.MM.YY)', () => {
        const parser = NetflixDateParser.fromDates(['15.03.20', '02.04.20']);

        expect(parser).not.toBeNull();
        expect(parser?.parseDate('15.03.20')).toEqual(new Date('2020-03-15'));
        expect(parser?.parseDate('02.04.20')).toEqual(new Date('2020-04-02'));
    });

    it('returns null on invalid or unparsable dates without throwing', () => {
        expect(NetflixDateParser.fromDates([])).toBeNull();
        expect(NetflixDateParser.fromDates(['invalid'])).toBeNull();

        const parser = NetflixDateParser.fromDates(['3/15/20']);

        expect(parser?.parseDate('invalid-date')).toBeNull();
        expect(parser?.parseDate('99/99/99')).toBeNull();
    });
});
