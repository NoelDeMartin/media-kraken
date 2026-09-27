import type { RangeSliderValue } from '@aerogel/core';
import { isNullable, type Nullable } from '@noeldemartin/utils';

import type Movie from '@/models/Movie';

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

export function movieMatchesFilters(movie: Movie, filters: Nullable<MoviesFilter>): boolean {
    if (!filters) {
        return true;
    }

    return (
        (isNullable(filters.watched) || filters.watched === movie.watched) &&
        (isNullable(filters.genres) || matchesAny(filters.genres, movie.genreIds)) &&
        (isNullable(filters.directors) ||
            matchesAny(filters.directors, movie.directors?.map((director) => director.name) ?? [])) &&
        (isNullable(filters.cast) || matchesAny(filters.cast, movie.actors?.map((actor) => actor.name) ?? [])) &&
        (isNullable(filters.countries) || matchesAny(filters.countries, movie.countryCodes)) &&
        (isNullable(filters.languages) || matchesAny(filters.languages, movie.languages)) &&
        (isNullable(filters.releaseYear) || matchesRange(filters.releaseYear, movie.releaseYear)) &&
        (isNullable(filters.duration) || matchesRange(filters.duration, movie.runtimeMinutes))
    );
}
