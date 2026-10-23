import type { RangeSliderValue } from '@aerogel/core';
import { isNullable, isTruthy, stringToSlug } from '@noeldemartin/utils';

import type Movie from '@/models/Movie';
import type { PersonCredit } from '@/models/Person';
import type Show from '@/models/Show';

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

export function mediaName(media: Movie | Show): string {
    return 'title' in media ? media.title : media.name;
}
