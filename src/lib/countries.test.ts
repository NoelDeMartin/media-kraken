import { describe, expect, it } from 'vitest';

import { countryCodeFromUrl, countryUrlFromCode } from '@/lib/countries';

describe('countries helpers', () => {
    it('maps country code to Wikidata IRI', () => {
        expect(countryUrlFromCode('US')).toBe('http://www.wikidata.org/entity/Q30');
        expect(countryUrlFromCode('us')).toBe('http://www.wikidata.org/entity/Q30');
        expect(countryUrlFromCode('SU')).toBe('http://www.wikidata.org/entity/Q15180');
        expect(countryUrlFromCode('DD')).toBe('http://www.wikidata.org/entity/Q16957');
        expect(countryUrlFromCode('YU')).toBe('http://www.wikidata.org/entity/Q36704');
        expect(countryUrlFromCode('CS')).toBe('http://www.wikidata.org/entity/Q33946');
        expect(countryUrlFromCode('XC')).toBe('http://www.wikidata.org/entity/Q33946');
        expect(countryUrlFromCode('XX')).toBeNull();
    });

    it('maps Wikidata IRI to country code', () => {
        expect(countryCodeFromUrl('http://www.wikidata.org/entity/Q30')).toBe('US');
        expect(countryCodeFromUrl('http://www.wikidata.org/entity/Q15180')).toBe('SU');
        expect(countryCodeFromUrl('http://www.wikidata.org/entity/Q16957')).toBe('DD');
        expect(countryCodeFromUrl('http://www.wikidata.org/entity/Q36704')).toBe('YU');
        expect(countryCodeFromUrl('http://www.wikidata.org/entity/Q33946')).toBe('CS');
        expect(countryCodeFromUrl('http://www.wikidata.org/entity/Q999999999')).toBeNull();
    });
});
