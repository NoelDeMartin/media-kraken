import { isTruthy, required } from '@noeldemartin/utils';

import { personFilterKey } from '@/lib/media';
import { countEntries, sortedEntries } from '@/lib/stats';
import type { MediaStatsEntry } from '@/lib/stats';
import { TMDB_GENRES, TMDB_NOISE_GENRES } from '@/lib/tmdb';
import type Movie from '@/models/Movie';
import type { PersonCredit } from '@/models/Person';
import type Show from '@/models/Show';
import type { WatchedEpisodesByMonth } from '@/models/Show';
import type { ShowWatchingStatus } from '@/models/ShowWatching';

export type MediaType = 'all' | 'movies' | 'shows';

export interface CollectionSummary {
    movies: {
        watched: MovieSummary[];
        pending: MovieSummary[];
    };
    shows: {
        [status in ShowWatchingStatus]: ShowSummary[];
    };
    taste: {
        [type in MediaType]: MediaStats;
    };
}

export interface MediaStats {
    titles: number;
    genres: MediaStatsEntry<number>[];
    countries: MediaStatsEntry<string>[];
    languages: MediaStatsEntry<string>[];
    makers: MediaStatsEntry<PersonCredit>[];
    cast: MediaStatsEntry<PersonCredit>[];
    decades: Map<number, number>;
}

export interface ChartEntry {
    label: string;
    value: number;
}

export interface CollectionSummaryOptions {
    credits: boolean;
    watchedEpisodesByMonth: Map<string, WatchedEpisodesByMonth>;
}

export interface MediaSummary {
    genreIds: number[];
    countryCodes: string[];
    languages: string[];
    releaseYear: number | null;
    makers: PersonCredit[];
    cast: PersonCredit[];
}

export interface MovieSummary extends MediaSummary {
    watched: boolean;
    watchedAt: Date | null;
    runtimeMinutes: number;
}

export interface ShowSummary extends MediaSummary {
    watchingStatus: ShowWatchingStatus;
    episodesWatched: number;
    episodesWatchedByMonth: WatchedEpisodesByMonth;
}

export function getMovieSummary(movie: Movie, options: CollectionSummaryOptions): MovieSummary {
    return {
        genreIds: movie.genreIds,
        countryCodes: movie.countryCodes,
        languages: movie.languages,
        releaseYear: movie.releaseYear,
        makers: (options.credits && movie.credits.value?.directors) || [],
        cast: (options.credits && movie.credits.value?.cast) || [],
        watched: !!movie.watched,
        watchedAt: movie.watchedAt,
        runtimeMinutes: movie.runtimeMinutes ?? 0,
    };
}

export function getShowSummary(show: Show, options: CollectionSummaryOptions): ShowSummary {
    const episodesWatchedByMonth = options.watchedEpisodesByMonth.get(show.requireUrl()) ?? {};

    return {
        genreIds: show.genreIds,
        countryCodes: show.countryCodes,
        languages: show.languages,
        releaseYear: show.releaseYear,
        makers: (options.credits && show.credits.value?.creators) || [],
        cast: (options.credits && show.credits.value?.cast) || [],
        watchingStatus: show.watchingStatus,
        episodesWatched: Object.values(episodesWatchedByMonth).reduce((total, count) => total + count, 0),
        episodesWatchedByMonth,
    };
}

export function getMediaStats(titles: MediaSummary[]): MediaStats {
    const noiseGenreIds = TMDB_NOISE_GENRES.map((genre) => TMDB_GENRES[genre]);

    return {
        titles: titles.length,
        genres: sortedEntries(
            titles.flatMap((title) => title.genreIds).filter((genreId) => !noiseGenreIds.includes(genreId)),
        ),
        countries: sortedEntries(titles.flatMap((title) => title.countryCodes)),
        languages: sortedEntries(titles.flatMap((title) => title.languages)),
        makers: sortedPeople(titles.flatMap((title) => title.makers)),
        cast: sortedPeople(titles.flatMap((title) => title.cast)),
        decades: countEntries(
            titles.map((title) => title.releaseYear && Math.floor(title.releaseYear / 10) * 10).filter(isTruthy),
        ),
    };
}

export function getCollectionSummary(
    movies: Movie[],
    shows: Show[],
    options: CollectionSummaryOptions,
): CollectionSummary {
    const collection: Omit<CollectionSummary, 'taste'> = {
        movies: {
            watched: [],
            pending: [],
        },
        shows: {
            watching: [],
            pending: [],
            dropped: [],
            completed: [],
        },
    };

    for (const movie of movies) {
        collection.movies[movie.watched ? 'watched' : 'pending'].push(getMovieSummary(movie, options));
    }

    for (const show of shows) {
        collection.shows[show.watchingStatus].push(getShowSummary(show, options));
    }

    const watchedMovies = collection.movies.watched;
    const startedShows = getStartedShows(collection);

    return {
        ...collection,
        taste: {
            all: getMediaStats([...watchedMovies, ...startedShows]),
            movies: getMediaStats(watchedMovies),
            shows: getMediaStats(startedShows),
        },
    };
}

export function getAllShows(collection: CollectionSummary): ShowSummary[] {
    return Object.values(collection.shows).flat();
}

export function getStartedShows(collection: Pick<CollectionSummary, 'shows'>): ShowSummary[] {
    return [...collection.shows.watching, ...collection.shows.completed, ...collection.shows.dropped];
}

export function getEpisodesWatched(collection: CollectionSummary): number {
    return getAllShows(collection).reduce((total, show) => total + show.episodesWatched, 0);
}

export function getEpisodesWatchedByMonth(collection: CollectionSummary): Map<string, number> {
    const byMonth = new Map<string, number>();

    for (const show of getAllShows(collection)) {
        for (const [month, count] of Object.entries(show.episodesWatchedByMonth)) {
            if (month === 'unknown') {
                continue;
            }

            byMonth.set(month, (byMonth.get(month) ?? 0) + count);
        }
    }

    return byMonth;
}

export function labelled<T>(entries: MediaStatsEntry<T>[], render: (key: T) => string): ChartEntry[] {
    return entries.map(({ key, count }) => ({ label: render(key), value: count }));
}

export function sortedPeople(people: PersonCredit[]): MediaStatsEntry<PersonCredit>[] {
    const credits = new Map<string, PersonCredit>();
    const keys = people
        .map((person) => {
            const key = personFilterKey(person);

            if (key) {
                credits.set(key, person);
            }

            return key;
        })
        .filter(isTruthy);

    return sortedEntries(keys).map(({ key, count }) => ({ key: required(credits.get(key)), count }));
}
