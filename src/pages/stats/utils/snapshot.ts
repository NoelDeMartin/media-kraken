import { isTruthy, required } from '@noeldemartin/utils';

import { genreKey, type GenreKey, type KnownGenreName } from '@/lib/genres';
import { personFilterKey } from '@/lib/media';
import type { PersonCredit } from '@/models/Person';
import type Movie from '@movies/models/Movie';
import type Show from '@shows/models/Show';
import type { ShowWatchingStatus } from '@shows/models/ShowWatching';

import { countEntries } from './count';

const SUPERFLUOUS_GENRES: KnownGenreName[] = [
    'Action & Adventure',
    'TV Movie',
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Music',
    'Thriller',
];

const SUPERFLUOUS_GENRE_KEYS = new Set(SUPERFLUOUS_GENRES.map(genreKey));

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
}

export interface MediaStats {
    titles: number;
    genres: MediaStatsEntry<GenreKey>[];
    countries: MediaStatsEntry<string>[];
    languages: MediaStatsEntry<string>[];
    makers: MediaStatsEntry<PersonCredit>[];
    cast: MediaStatsEntry<PersonCredit>[];
    decades: MediaStatsEntry<number>[];
}

export interface MediaStatsEntry<T> {
    key: T;
    count: number;
}

export interface ChartEntry {
    key: string;
    label: string;
    value: number;
}

export interface MediaSnapshot {
    genreKeys: GenreKey[];
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
    seasonsWatched: number;
}

function sortedEntries<T>(items: T[]): MediaStatsEntry<T>[] {
    return Array.from(countEntries(items).entries())
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count);
}

function getMovieSnapshot(movie: Movie): MovieSnapshot {
    return {
        title: movie.title,
        genreKeys: movie.genreKeys,
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

function getShowSnapshot(show: Show): ShowSnapshot {
    const watchedEpisodes = show.watchedEpisodes.value;

    return {
        name: show.name,
        genreKeys: show.genreKeys,
        countryCodes: show.countryCodes,
        languages: show.languages,
        releaseYear: show.releaseYear,
        makers: show.credits.value?.creators ?? [],
        cast: show.credits.value?.cast ?? [],
        watchingStatus: show.watchingStatus,
        episodesWatched: watchedEpisodes?.episodes ?? 0,
        seasonsWatched: watchedEpisodes?.seasons ?? 0,
    };
}

function sortedPeople(people: PersonCredit[]): MediaStatsEntry<PersonCredit>[] {
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

function getMediaStats(titles: MediaSnapshot[]): MediaStats {
    return {
        titles: titles.length,
        genres: sortedEntries(
            titles.flatMap((title) => title.genreKeys).filter((key) => !SUPERFLUOUS_GENRE_KEYS.has(key)),
        ),
        countries: sortedEntries(titles.flatMap((title) => title.countryCodes)),
        languages: sortedEntries(titles.flatMap((title) => title.languages)),
        makers: sortedPeople(titles.flatMap((title) => title.makers)),
        cast: sortedPeople(titles.flatMap((title) => title.cast)),
        decades: sortedEntries(
            titles.map((title) => title.releaseYear && Math.floor(title.releaseYear / 10) * 10).filter(isTruthy),
        ),
    };
}

export function getAllShows(snapshot: Pick<StatsSnapshot, 'shows'>): ShowSnapshot[] {
    return Object.values(snapshot.shows).flat();
}

export function getStartedShows(snapshot: Pick<StatsSnapshot, 'shows'>): ShowSnapshot[] {
    return [...snapshot.shows.watching, ...snapshot.shows.completed, ...snapshot.shows.dropped];
}

export function getEpisodesWatched(snapshot: Pick<StatsSnapshot, 'shows'>): number {
    return getAllShows(snapshot).reduce((total, show) => total + show.episodesWatched, 0);
}

export function getStatsSnapshot(movies: Movie[], shows: Show[]): StatsSnapshot {
    const snapshot: Omit<StatsSnapshot, 'mediaStats'> = {
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
        snapshot.shows[show.watchingStatus].push(getShowSnapshot(show));
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
    };
}
