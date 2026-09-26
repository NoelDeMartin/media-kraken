import type { RangeSliderValue } from '@aerogel/core';
import { isNullable, type Nullable } from '@noeldemartin/utils';

export type MovieWatchStatus = 'all' | 'watched' | 'unwatched';

export type MoviesFilter = {
    genres?: Nullable<number[]>;
    directors?: Nullable<string[]>;
    cast?: Nullable<string[]>;
    countries?: Nullable<string[]>;
    languages?: Nullable<string[]>;
    releaseYear?: Nullable<RangeSliderValue>;
    duration?: Nullable<RangeSliderValue>;
    watchStatus?: Nullable<MovieWatchStatus>;
};

export interface FilterableMovie {
    genreIds: number[];
    countryCodes: string[];
    languages: string[];
    directors?: Nullable<{ name?: Nullable<string> }[]>;
    actors?: Nullable<{ name?: Nullable<string> }[]>;
    releaseYear: number | null;
    runtimeMinutes: number | null;
    watched: boolean | null;
}

function hasItems<T>(items: Nullable<T[]>): items is T[] {
    return !!items && items.length > 0;
}

function hasRange(range: Nullable<RangeSliderValue>): range is RangeSliderValue {
    return !!range && (!isNullable(range[0]) || !isNullable(range[1]));
}

function matchesAny<T>(selected: Nullable<T[]>, values: Nullable<T>[]): boolean {
    return !hasItems(selected) || values.some((value) => !isNullable(value) && selected.includes(value));
}

function matchesRange(range: Nullable<RangeSliderValue>, value: number | null): boolean {
    if (!hasRange(range)) {
        return true;
    }

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
        hasItems(filters.genres) ||
        hasItems(filters.directors) ||
        hasItems(filters.cast) ||
        hasItems(filters.countries) ||
        hasItems(filters.languages) ||
        hasRange(filters.releaseYear) ||
        hasRange(filters.duration) ||
        (!!filters.watchStatus && filters.watchStatus !== 'all')
    );
}

export function movieMatchesFilters(movie: FilterableMovie, filters: Nullable<MoviesFilter>): boolean {
    if (!filters) {
        return true;
    }

    if (filters.watchStatus === 'watched' && !movie.watched) {
        return false;
    }

    if (filters.watchStatus === 'unwatched' && movie.watched) {
        return false;
    }

    return (
        matchesAny(filters.genres, movie.genreIds) &&
        matchesAny(filters.directors, movie.directors?.map((director) => director.name) ?? []) &&
        matchesAny(filters.cast, movie.actors?.map((actor) => actor.name) ?? []) &&
        matchesAny(filters.countries, movie.countryCodes) &&
        matchesAny(filters.languages, movie.languages) &&
        matchesRange(filters.releaseYear, movie.releaseYear) &&
        matchesRange(filters.duration, movie.runtimeMinutes)
    );
}
