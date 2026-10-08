import type { RangeSliderValue } from '@aerogel/core';
import { isNullable, isTruthy, stringToSlug } from '@noeldemartin/utils';

import { formatCountry, formatLanguage } from '@/lib/formatting';
import type { PersonCredit } from '@/models/Person';
import TMDB from '@/services/TMDB';

export function formatGenres(genreIds: number[]): string {
    return genreIds
        .map((id) => TMDB.translateGenre(id))
        .filter(isTruthy)
        .join(', ');
}

export function formatCountries(countryCodes: string[]): string {
    return countryCodes.map((code) => formatCountry(code)).join(', ');
}

export function formatLanguages(languages: string[]): string {
    return languages.map((language) => formatLanguage(language)).join(', ');
}

export function matchesAny<T>(selected: T[], values: T[]): boolean {
    return values.some((value) => !isNullable(value) && selected.includes(value));
}

export function matchesRange(range: RangeSliderValue, value: number | null): boolean {
    const [min, max] = range;

    if (value === null) {
        return false;
    }

    return (isNullable(min) || value >= min) && (isNullable(max) || value <= max);
}

export function personFilterKey(person: PersonCredit): string | null {
    if (person.tmdbId) {
        return `tmdb-${person.tmdbId}`;
    }

    return stringToSlug(person.name) || null;
}

export function sortByLocale<T>(items: T[], render: (item: T) => string): T[] {
    return items.slice(0).sort((a, b) => render(a).localeCompare(render(b)));
}

export function toSearchText(text: string): string {
    return stringToSlug(text).replaceAll('-', '');
}

export function uniquePersonKeys(people: PersonCredit[]): string[] {
    return Array.from(new Set(people.map(personFilterKey).filter(isTruthy)));
}
