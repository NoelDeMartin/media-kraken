import type { RangeSliderValue } from '@aerogel/core';
import { isNullable, isTruthy, type Nullable } from '@noeldemartin/utils';

import type { QueryFilterFields } from '@/lib/composition/filters';
import type { GenreKey } from '@/lib/genres';
import { matchesAny, matchesRange, personFilterKey, toSearchText } from '@/lib/media';
import type Show from '@shows/models/Show';
import type { ShowWatchingStatus } from '@shows/models/ShowWatching';

export type ShowsFilter = {
    watchingStatus?: Nullable<ShowWatchingStatus>;
    genres?: Nullable<GenreKey[]>;
    creators?: Nullable<string[]>;
    cast?: Nullable<string[]>;
    countries?: Nullable<string[]>;
    languages?: Nullable<string[]>;
    seasons?: Nullable<RangeSliderValue>;
    releaseYear?: Nullable<RangeSliderValue>;
    rating?: Nullable<RangeSliderValue>;
    withNotes?: Nullable<boolean>;
};

export const SHOWS_FILTER_FIELDS: QueryFilterFields<ShowsFilter> = {
    watchingStatus: 'string',
    genres: 'list',
    creators: 'list',
    cast: 'list',
    countries: 'list',
    languages: 'list',
    seasons: 'range',
    releaseYear: 'range',
    rating: 'range',
    withNotes: 'boolean',
};

export type ShowSearchEntry = ReturnType<typeof createShowSearchEntry>;

export function hasActiveShowFilters(filters: Nullable<ShowsFilter>): boolean {
    if (!filters) {
        return false;
    }

    return (
        !isNullable(filters.genres) ||
        !isNullable(filters.creators) ||
        !isNullable(filters.cast) ||
        !isNullable(filters.countries) ||
        !isNullable(filters.languages) ||
        !isNullable(filters.releaseYear) ||
        !isNullable(filters.seasons) ||
        !isNullable(filters.rating) ||
        !isNullable(filters.watchingStatus) ||
        !!filters.withNotes
    );
}

// oxlint-disable-next-line typescript/explicit-module-boundary-types
export function createShowSearchEntry(show: Show) {
    return {
        show,
        searchText: toSearchText(`${show.name} ${show.releaseYear ?? ''}`),
        genreKeys: show.genreKeys,
        countryCodes: show.countryCodes,
        languages: show.languages,
        releaseYear: show.releaseYear,
        get numberOfSeasons(): number | null {
            return show.numberOfSeasons;
        },
        get watchingStatus(): ShowWatchingStatus {
            return show.watchingStatus;
        },
        get rating(): number | null {
            return show.rating;
        },
        get hasNotes(): boolean {
            return !!show.notes;
        },
        get creators(): string[] {
            return show.credits.value?.creators.map(personFilterKey).filter(isTruthy) ?? [];
        },
        get cast(): string[] {
            return show.credits.value?.cast.map(personFilterKey).filter(isTruthy) ?? [];
        },
    };
}

export function showMatchesQuery(entry: ShowSearchEntry, searchQuery: Nullable<string>): boolean {
    return !searchQuery || entry.searchText.includes(searchQuery);
}

export function showMatchesFilters(entry: ShowSearchEntry, filters: Nullable<ShowsFilter>): boolean {
    if (!filters) {
        return true;
    }

    return (
        (isNullable(filters.releaseYear) || matchesRange(filters.releaseYear, entry.releaseYear)) &&
        (isNullable(filters.seasons) || matchesRange(filters.seasons, entry.numberOfSeasons)) &&
        (isNullable(filters.rating) || matchesRange(filters.rating, entry.rating)) &&
        (!filters.withNotes || entry.hasNotes) &&
        (isNullable(filters.watchingStatus) || filters.watchingStatus === entry.watchingStatus) &&
        (isNullable(filters.genres) || matchesAny(filters.genres, entry.genreKeys)) &&
        (isNullable(filters.countries) || matchesAny(filters.countries, entry.countryCodes)) &&
        (isNullable(filters.languages) || matchesAny(filters.languages, entry.languages)) &&
        (isNullable(filters.creators) || matchesAny(filters.creators, entry.creators)) &&
        (isNullable(filters.cast) || matchesAny(filters.cast, entry.cast))
    );
}
