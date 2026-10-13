import { isTruthy, required } from '@noeldemartin/utils';

import { personFilterKey } from '@/lib/media';
import { countEntries, sortedEntries } from '@/lib/stats';
import type { MediaStatsEntry } from '@/lib/stats';
import { TMDB_GENRES, TMDB_NOISE_GENRES } from '@/lib/tmdb';
import type Movie from '@/models/Movie';
import type { PersonCredit } from '@/models/Person';
import type Show from '@/models/Show';
import type { WatchedEpisodes, WatchedEpisodesByMonth } from '@/models/Show';
import type { ShowWatchingStatus } from '@/models/ShowWatching';

export const MediaTypes = ['all', 'movies', 'shows'] as const;
export type MediaType = (typeof MediaTypes)[number];

export interface StatsSnapshot {
    movies: {
        watched: MovieSnapshot[];
        pending: MovieSnapshot[];
    };
    shows: {
        [status in ShowWatchingStatus]: ShowSnapshot[];
    };
    mediaStats: {
        [type in MediaType]: MediaStats;
    };
    loadingCredits: boolean;
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

export interface StatsSnapshotOptions {
    watchedEpisodes: Map<string, WatchedEpisodes>;
}

export interface MediaSnapshot {
    genreIds: number[];
    countryCodes: string[];
    languages: string[];
    releaseYear: number | null;
    makers: PersonCredit[];
    cast: PersonCredit[];
}

export interface MovieSnapshot extends MediaSnapshot {
    title: string;
    releaseDate: Date | null;
    watched: boolean;
    watchedAt: Date | null;
    runtimeMinutes: number;
}

export interface ShowSnapshot extends MediaSnapshot {
    name: string;
    watchingStatus: ShowWatchingStatus;
    episodesWatched: number;
    episodesWatchedByMonth: WatchedEpisodesByMonth;
    seasonsWatched: number;
}

export function getMovieSnapshot(movie: Movie): MovieSnapshot {
    return {
        title: movie.title,
        genreIds: movie.genreIds,
        countryCodes: movie.countryCodes,
        languages: movie.languages,
        releaseYear: movie.releaseYear,
        releaseDate: movie.releaseDate ?? null,
        makers: movie.credits.value?.directors ?? [],
        cast: movie.credits.value?.cast ?? [],
        watched: !!movie.watched,
        watchedAt: movie.watchedAt,
        runtimeMinutes: movie.runtimeMinutes ?? 0,
    };
}

export function getShowSnapshot(show: Show, options: StatsSnapshotOptions): ShowSnapshot {
    const watchedEpisodes = options.watchedEpisodes.get(show.requireUrl());
    const episodesWatchedByMonth = watchedEpisodes?.byMonth ?? {};

    return {
        name: show.name,
        genreIds: show.genreIds,
        countryCodes: show.countryCodes,
        languages: show.languages,
        releaseYear: show.releaseYear,
        makers: show.credits.value?.creators ?? [],
        cast: show.credits.value?.cast ?? [],
        watchingStatus: show.watchingStatus,
        episodesWatched: Object.values(episodesWatchedByMonth).reduce((total, count) => total + count, 0),
        episodesWatchedByMonth,
        seasonsWatched: watchedEpisodes?.seasons ?? 0,
    };
}

export function getMediaStats(titles: MediaSnapshot[]): MediaStats {
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

export function getStatsSnapshot(movies: Movie[], shows: Show[], options: StatsSnapshotOptions): StatsSnapshot {
    const snapshot: Omit<StatsSnapshot, 'mediaStats' | 'loadingCredits'> = {
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
        snapshot.movies[movie.watched ? 'watched' : 'pending'].push(getMovieSnapshot(movie));
    }

    for (const show of shows) {
        snapshot.shows[show.watchingStatus].push(getShowSnapshot(show, options));
    }

    const watchedMovies = snapshot.movies.watched;
    const startedShows = getStartedShows(snapshot);

    return {
        ...snapshot,
        mediaStats: {
            all: getMediaStats([...watchedMovies, ...startedShows]),
            movies: getMediaStats(watchedMovies),
            shows: getMediaStats(startedShows),
        },
        loadingCredits: [...movies, ...shows].some((media) => !media.credits.value),
    };
}

export function getAllShows(snapshot: StatsSnapshot): ShowSnapshot[] {
    return Object.values(snapshot.shows).flat();
}

export function getStartedShows(snapshot: Pick<StatsSnapshot, 'shows'>): ShowSnapshot[] {
    return [...snapshot.shows.watching, ...snapshot.shows.completed, ...snapshot.shows.dropped];
}

export function getEpisodesWatched(snapshot: StatsSnapshot): number {
    return getAllShows(snapshot).reduce((total, show) => total + show.episodesWatched, 0);
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
