import type { RangeSliderValue } from '@aerogel/core';
import { isNullable, isTruthy, stringToSlug } from '@noeldemartin/utils';
import type { BelongsToManyRelation, Model } from 'soukai-bis';
import type { RouteLocationRaw } from 'vue-router';

import type { GenreKey } from '@/lib/genres';
import type PerformanceRole from '@/models/PerformanceRole';
import type { PersonCredit } from '@/models/Person';

export interface Media extends Model {
    readonly name: string;
    readonly slug: string;
    readonly route: RouteLocationRaw;
    readonly posterUrl?: string;
    readonly description?: string;
    readonly releaseYear: number | null;
    readonly tmdbId: number | null;
    readonly imdbId: string | null;
    readonly externalUrls: string[];
    readonly genreUrls: string[];
    readonly genreKeys: GenreKey[];
    readonly actorUrls: string[];
    readonly countryUrls: string[];
    readonly countryCodes: string[];
    readonly languages: string[];
    readonly cast?: PerformanceRole[];
    readonly relatedCast: BelongsToManyRelation<this, PerformanceRole, typeof PerformanceRole>;

    loadAllRelationsIfUnloaded(): Promise<void>;
    deleteWithRelations(): Promise<void>;
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
