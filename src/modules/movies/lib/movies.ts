import { renderMarkdownAsText, type RangeSliderValue } from '@aerogel/core';
import { isNullable, isTruthy, type Nullable } from '@noeldemartin/utils';

import type { QueryFilterFields } from '@/lib/composition/filters';
import { formatCountries, formatGenres, formatLanguages } from '@/lib/formatting';
import type { GenreKey } from '@/lib/genres';
import { matchesAny, matchesRange, personFilterKey, toSearchText } from '@/lib/media';
import type Movie from '@movies/models/Movie';
import type { MovieWatchingStatus } from '@movies/models/WatchAction';

export type MoviesFilter = {
    watchingStatus?: Nullable<MovieWatchingStatus>;
    genres?: Nullable<GenreKey[]>;
    directors?: Nullable<string[]>;
    cast?: Nullable<string[]>;
    countries?: Nullable<string[]>;
    languages?: Nullable<string[]>;
    duration?: Nullable<RangeSliderValue>;
    releaseYear?: Nullable<RangeSliderValue>;
    rating?: Nullable<RangeSliderValue>;
    withNotes?: Nullable<boolean>;
};

export const MOVIES_FILTER_FIELDS: QueryFilterFields<MoviesFilter> = {
    watchingStatus: 'string',
    genres: 'list',
    directors: 'list',
    cast: 'list',
    countries: 'list',
    languages: 'list',
    duration: 'range',
    releaseYear: 'range',
    rating: 'range',
    withNotes: 'boolean',
};

export type MovieSearchEntry = ReturnType<typeof createMovieSearchEntry>;
export type MovieTableItem = ReturnType<typeof renderMovieTableItem>;

// oxlint-disable-next-line typescript/explicit-module-boundary-types
export function renderMovieTableItem(movie: Movie) {
    return {
        ...movie.getAttributes(),
        route: movie.route,
        genres: formatGenres(movie.genreKeys),
        countries: formatCountries(movie.countryCodes),
        languages: formatLanguages(movie.languages),
        runtimeMinutes: movie.runtimeMinutes,
        releaseYear: movie.releaseYear,
        watchedAt: movie.watchedAt,
        watchDates: movie.watches.map((watch) => watch.endTime ?? null),
        rating: movie.rating,
        hasNotes: !!movie.notes,
        get notesPreview(): string | undefined {
            return movie.notes ? renderMarkdownAsText(movie.notes, { maxLength: 300 }) : undefined;
        },
    };
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
        !isNullable(filters.rating) ||
        !isNullable(filters.watchingStatus) ||
        !!filters.withNotes
    );
}

// oxlint-disable-next-line typescript/explicit-module-boundary-types
export function createMovieSearchEntry(movie: Movie) {
    return {
        movie,
        searchText: toSearchText(`${movie.title} ${movie.releaseYear ?? ''}`),
        genreKeys: movie.genreKeys,
        countryCodes: movie.countryCodes,
        languages: movie.languages,
        releaseYear: movie.releaseYear,
        runtimeMinutes: movie.runtimeMinutes,
        get watchingStatus(): MovieWatchingStatus {
            return movie.watchingStatus;
        },
        get rating(): number | null {
            return movie.rating;
        },
        get hasNotes(): boolean {
            return !!movie.notes;
        },
        get directors(): string[] {
            return movie.credits.value?.directors.map(personFilterKey).filter(isTruthy) ?? [];
        },
        get cast(): string[] {
            return movie.credits.value?.cast.map(personFilterKey).filter(isTruthy) ?? [];
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
        (isNullable(filters.rating) || matchesRange(filters.rating, entry.rating)) &&
        (!filters.withNotes || entry.hasNotes) &&
        (isNullable(filters.watchingStatus) || filters.watchingStatus === entry.watchingStatus) &&
        (isNullable(filters.genres) || matchesAny(filters.genres, entry.genreKeys)) &&
        (isNullable(filters.countries) || matchesAny(filters.countries, entry.countryCodes)) &&
        (isNullable(filters.languages) || matchesAny(filters.languages, entry.languages)) &&
        (isNullable(filters.directors) || matchesAny(filters.directors, entry.directors)) &&
        (isNullable(filters.cast) || matchesAny(filters.cast, entry.cast))
    );
}
