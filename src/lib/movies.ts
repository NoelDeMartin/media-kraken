import type { RangeSliderValue } from '@aerogel/core';
import { isNullable, isTruthy, stringToSlug, type Nullable } from '@noeldemartin/utils';

import type Movie from '@/models/Movie';
import type Person from '@/models/Person';

export type MoviesFilter = {
    watched?: Nullable<boolean>;
    genres?: Nullable<number[]>;
    directors?: Nullable<string[]>;
    cast?: Nullable<string[]>;
    countries?: Nullable<string[]>;
    languages?: Nullable<string[]>;
    duration?: Nullable<RangeSliderValue>;
    releaseYear?: Nullable<RangeSliderValue>;
};

export type MovieSearchEntry = ReturnType<typeof createMovieSearchEntry>;

function matchesAny<T>(selected: T[], values: T[]): boolean {
    return values.some((value) => !isNullable(value) && selected.includes(value));
}

function matchesRange(range: RangeSliderValue, value: number | null): boolean {
    const [min, max] = range;

    if (value === null) {
        return false;
    }

    return (isNullable(min) || value >= min) && (isNullable(max) || value <= max);
}

export function hasActiveMovieFilters(filters: Nullable<MoviesFilter>): boolean {
    if (!filters) {
        return false;
    }

    return (
        !isNullable(filters.genres) ||
        !isNullable(filters.directors) ||
        !isNullable(filters.cast) ||
        !isNullable(filters.countries) ||
        !isNullable(filters.languages) ||
        !isNullable(filters.releaseYear) ||
        !isNullable(filters.duration) ||
        !isNullable(filters.watched)
    );
}

export function personFilterKey(person: Person): string | null {
    if (person.tmdbId) {
        return `tmdb-${person.tmdbId}`;
    }

    return stringToSlug(person.name) || null;
}

export function toMovieSearchText(text: string): string {
    return stringToSlug(text).replaceAll('-', '');
}

// oxlint-disable-next-line typescript/explicit-module-boundary-types
export function createMovieSearchEntry(movie: Movie) {
    return {
        movie,
        searchText: toMovieSearchText(movie.getSlug() ?? ''),
        genreIds: movie.genreIds,
        countryCodes: movie.countryCodes,
        languages: movie.languages,
        releaseYear: movie.releaseYear,
        runtimeMinutes: movie.runtimeMinutes,
        get watched(): boolean | null {
            return movie.watched;
        },
        get directors(): string[] {
            return movie.directors?.map(personFilterKey).filter(isTruthy) ?? [];
        },
        get cast(): string[] {
            return movie.cast?.map((role) => role.actor && personFilterKey(role.actor)).filter(isTruthy) ?? [];
        },
    };
}

export function movieMatchesQuery(entry: MovieSearchEntry, searchQuery: Nullable<string>): boolean {
    return !searchQuery || entry.searchText.includes(searchQuery);
}

export function movieMatchesFilters(entry: MovieSearchEntry, filters: Nullable<MoviesFilter>): boolean {
    if (!filters) {
        return true;
    }

    return (
        (isNullable(filters.releaseYear) || matchesRange(filters.releaseYear, entry.releaseYear)) &&
        (isNullable(filters.duration) || matchesRange(filters.duration, entry.runtimeMinutes)) &&
        (isNullable(filters.watched) || filters.watched === entry.watched) &&
        (isNullable(filters.genres) || matchesAny(filters.genres, entry.genreIds)) &&
        (isNullable(filters.countries) || matchesAny(filters.countries, entry.countryCodes)) &&
        (isNullable(filters.languages) || matchesAny(filters.languages, entry.languages)) &&
        (isNullable(filters.directors) || matchesAny(filters.directors, entry.directors)) &&
        (isNullable(filters.cast) || matchesAny(filters.cast, entry.cast))
    );
}
