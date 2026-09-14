import { objectEntries } from '@noeldemartin/utils';

import ISO_3166_1_TO_WIKIDATA from '@/assets/data/wikidata-countries.json';

const WIKIDATA_TO_ISO_3166_1 = objectEntries(ISO_3166_1_TO_WIKIDATA).reduce(
    (acc, [code, url]) => {
        if (!acc[url] || ['XG', 'XC'].includes(acc[url])) {
            acc[url] = code;
        }

        return acc;
    },
    {} as Record<string, string>,
);

export function countryUrlFromCode(code: string): string | null {
    return (ISO_3166_1_TO_WIKIDATA as Record<string, string>)[code.toUpperCase()] ?? null;
}

export function countryCodeFromUrl(url: string): string | null {
    return WIKIDATA_TO_ISO_3166_1[url] ?? null;
}
