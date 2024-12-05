import { fail } from '@noeldemartin/utils';
import { getNetflixDateParser } from '@/utils/netflix';

describe('Netflix utils', () => {

    it('guesses date regular expressions', () => {
        expect(getNetflixDateParser([
            '7/31/19',
            '7/27/19',
            '3/2/19',
        ])?.regExp).toEqual(/(?<month>\d+)\/(?<day>\d+)\/(?<shortYear>\d+)/);

        expect(getNetflixDateParser([
            '2020-05-05',
            '2020-04-21',
            '2020-03-15',
        ])?.regExp).toEqual(/(?<year>\d+)-(?<month>\d+)-(?<day>\d+)/);

        expect(getNetflixDateParser([
            '05/05/2020',
            '04/21/2020',
            '03/15/2020',
        ])?.regExp).toEqual(/(?<month>\d+)\/(?<day>\d+)\/(?<year>\d+)/);

        expect(getNetflixDateParser(['invalid'])).toEqual(null);
    });

    it('parses dates', () => {
        const yearParser = getNetflixDateParser([
            '05/05/2020',
            '04/21/2020',
            '03/15/2020',
        ]) ?? fail();

        const shortYearParser = getNetflixDateParser([
            '7/31/19',
            '7/27/19',
            '3/2/19',
        ]) ?? fail();

        expect(yearParser.parseDate('05/18/2020')).toEqual(new Date('2020-05-18'));
        expect(shortYearParser.parseDate('5/18/20')).toEqual(new Date('2020-05-18'));
        expect(shortYearParser.parseDate('5/18/9')).toEqual(new Date('2009-05-18'));
    });

});
