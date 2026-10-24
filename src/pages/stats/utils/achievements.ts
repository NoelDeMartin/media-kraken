import { translate } from '@aerogel/core';
import { arrayGroupBy, arraySorted, isTruthy } from '@noeldemartin/utils';
import type { Component } from 'vue';
import IconCalendar from '~icons/ph/calendar-star-fill';
import IconEye from '~icons/ph/eye-fill';
import IconGhost from '~icons/ph/ghost-fill';
import IconGlobe from '~icons/ph/globe-hemisphere-west-fill';
import IconHeart from '~icons/ph/heart-fill';
import IconHourglass from '~icons/ph/hourglass-medium-fill';
import IconMask from '~icons/ph/mask-happy-fill';
import IconPopcorn from '~icons/ph/popcorn-fill';
import IconTelevision from '~icons/ph/television-simple-fill';
import IconTicket from '~icons/ph/ticket-fill';
import IconTranslate from '~icons/ph/translate-fill';
import IconTree from '~icons/ph/tree-evergreen-fill';

import { formatDuration, formatList, formatNumber } from '@/lib/formatting';
import { genreKey, type GenreKey } from '@/lib/genres';
import { personFilterKey } from '@/lib/media';

import { countEntries } from './count';
import { getAllShows, getEpisodesWatched, type MovieSnapshot, type StatsSnapshot } from './snapshot';

const ACHIEVEMENTS: Achievement[] = [
    { id: 'globetrotter', icon: IconGlobe, target: 25, value: (stats) => stats.countries },
    { id: 'polyglot', icon: IconTranslate, target: 10, value: (stats) => stats.languages },
    { id: 'eclectic', icon: IconMask, target: 15, value: (stats) => stats.genres },
    { id: 'timeTraveler', icon: IconHourglass, target: 10, value: (stats) => stats.decades },
    { id: 'seasoned', icon: IconTelevision, target: 1000, value: (stats) => stats.watchedEpisodes },
    { id: 'anniversary', icon: IconCalendar, target: 365, value: (stats) => stats.watchedMovies },
    {
        id: 'attentionSpan',
        icon: IconEye,
        target: 1,
        secret: true,
        value: (stats) => (stats.longestMovieMinutes >= 180 ? 1 : 0),
        details: (stats) =>
            stats.longestMovieTitle &&
            translate('stats.achievements.attentionSpan.details', {
                title: stats.longestMovieTitle,
                duration: formatDuration({ minutes: stats.longestMovieMinutes }),
            }),
    },
    {
        id: 'committedFan',
        icon: IconHeart,
        target: 1,
        secret: true,
        value: (stats) => (stats.mostSeasonsWatched > 10 ? 1 : 0),
        details: (stats) =>
            stats.mostSeasonsWatchedShowName &&
            translate('stats.achievements.committedFan.details', {
                title: stats.mostSeasonsWatchedShowName,
                seasons: formatNumber(stats.mostSeasonsWatched),
            }),
    },
    {
        id: 'marathon',
        icon: IconPopcorn,
        target: 1,
        secret: true,
        value: (stats) => (stats.mostSameDirectorMoviesInADay >= 3 ? 1 : 0),
        details: (stats) =>
            stats.marathonMovieTitles.length > 0
                ? translate('stats.achievements.marathon.details', {
                      titles: formatList(stats.marathonMovieTitles, 'conjunction'),
                  })
                : null,
    },
    {
        id: 'premiere',
        icon: IconTicket,
        target: 1,
        secret: true,
        value: (stats) => (stats.premieredMovieTitle ? 1 : 0),
        details: (stats) =>
            stats.premieredMovieTitle &&
            translate('stats.achievements.premiere.details', { title: stats.premieredMovieTitle }),
    },
    {
        id: 'spookySeason',
        icon: IconGhost,
        target: 10,
        secret: true,
        value: (stats) => stats.mostHorrorMoviesInAnOctober,
    },
    {
        id: 'jingleBells',
        icon: IconTree,
        target: 10,
        secret: true,
        value: (stats) => stats.mostChristmasMoviesInADecember,
    },
];

const MAX_MOVIES_WATCHED_IN_A_DAY = 10;
const MAX_MINUTES_WATCHED_IN_A_DAY = 24 * 60;

export interface Achievement {
    id: string;
    icon: Component;
    target: number;
    secret?: boolean;
    value: (stats: AchievementsStats) => number;
    details?: (stats: AchievementsStats) => string | null;
}

export interface AchievementsStats {
    watchedMovies: number;
    watchedEpisodes: number;
    countries: number;
    languages: number;
    genres: number;
    decades: number;
    longestMovieMinutes: number;
    longestMovieTitle: string | null;
    mostSeasonsWatched: number;
    mostSeasonsWatchedShowName: string | null;
    mostSameDirectorMoviesInADay: number;
    marathonMovieTitles: string[];
    premieredMovieTitle: string | null;
    mostHorrorMoviesInAnOctober: number;
    mostChristmasMoviesInADecember: number;
}

export interface AchievementProgress {
    achievement: Achievement;
    value: number;
    unlocked: boolean;
    revealed: boolean;
    secretNumber: number | null;
    details: string | null;
}

function releaseDayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function watchedDayKey(date: Date): string {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((n) => String(n).padStart(2, '0')).join('-');
}

function arrayMax<T>(items: T[], selector: (item: T) => number): T | null {
    const firstItem = items[0];

    if (!firstItem) {
        return null;
    }

    return items.reduce((max, item) => (selector(item) > selector(max) ? item : max), firstItem);
}

function getAchievementsStats(snapshot: StatsSnapshot): AchievementsStats {
    const watchedMovies = snapshot.movies.watched;
    const datedMovies = getPlausiblyDatedMovies(watchedMovies);
    const { all } = snapshot.mediaStats;
    const longestMovie = arrayMax(watchedMovies, (movie) => movie.runtimeMinutes);
    const mostWatchedShow = arrayMax(getAllShows(snapshot), (show) => show.seasonsWatched);
    const marathon = arraySorted(getBiggestMakerMarathon(datedMovies), 'watchedAt', 'asc');

    return {
        watchedMovies: watchedMovies.length,
        watchedEpisodes: getEpisodesWatched(snapshot),
        countries: all.countries.length,
        languages: all.languages.length,
        genres: all.genres.length,
        decades: all.decades.length,
        longestMovieMinutes: longestMovie?.runtimeMinutes ?? 0,
        longestMovieTitle: longestMovie?.title ?? null,
        mostSeasonsWatched: mostWatchedShow?.seasonsWatched ?? 0,
        mostSeasonsWatchedShowName: mostWatchedShow?.name ?? null,
        mostSameDirectorMoviesInADay: marathon.length,
        marathonMovieTitles: marathon.map((movie) => movie.title),
        premieredMovieTitle: getFirstPremieredMovie(datedMovies)?.title ?? null,
        mostHorrorMoviesInAnOctober: getMostGenreMoviesInAMonth(datedMovies, genreKey('Horror'), 9),
        mostChristmasMoviesInADecember: getMostGenreMoviesInAMonth(datedMovies, genreKey('Christmas'), 11),
    };
}

function getPlausiblyDatedMovies(movies: MovieSnapshot[]): MovieSnapshot[] {
    const days = arrayGroupBy(
        movies.filter((movie): movie is MovieSnapshot & { watchedAt: Date } => !!movie.watchedAt),
        (movie) => watchedDayKey(movie.watchedAt),
    );

    return Object.values(days)
        .filter(isTruthy)
        .filter(
            (dayMovies) =>
                dayMovies.length <= MAX_MOVIES_WATCHED_IN_A_DAY &&
                dayMovies.reduce((minutes, movie) => minutes + movie.runtimeMinutes, 0) <= MAX_MINUTES_WATCHED_IN_A_DAY,
        )
        .flat();
}

function getFirstPremieredMovie(movies: MovieSnapshot[]): MovieSnapshot | null {
    const premiered = movies.filter(
        (movie) =>
            movie.watchedAt && movie.releaseDate && watchedDayKey(movie.watchedAt) <= releaseDayKey(movie.releaseDate),
    );

    return arraySorted(premiered, 'watchedAt', 'asc')[0] ?? null;
}

function getBiggestMakerMarathon(movies: MovieSnapshot[]): MovieSnapshot[] {
    const marathons = new Map<string, MovieSnapshot[]>();

    for (const movie of movies) {
        const watchedAt = movie.watchedAt;

        if (!watchedAt) {
            continue;
        }

        for (const maker of movie.makers.map(personFilterKey).filter(isTruthy)) {
            const key = `${watchedDayKey(watchedAt)}|${maker}`;

            marathons.set(key, [...(marathons.get(key) ?? []), movie]);
        }
    }

    return Array.from(marathons.values()).reduce<MovieSnapshot[]>(
        (biggest, marathon) => (marathon.length > biggest.length ? marathon : biggest),
        [],
    );
}

function getMostGenreMoviesInAMonth(movies: MovieSnapshot[], genre: GenreKey, month: number): number {
    const years = movies
        .filter((movie) => movie.watchedAt?.getMonth() === month && movie.genreKeys.includes(genre))
        .map((movie) => movie.watchedAt?.getFullYear());

    return Math.max(0, ...countEntries(years).values());
}

export function getAchievementsProgress(snapshot: StatsSnapshot): AchievementProgress[] {
    const stats = getAchievementsStats(snapshot);
    let secrets = 0;

    return ACHIEVEMENTS.map((achievement) => {
        const value = achievement.value(stats);
        const unlocked = value >= achievement.target;

        return {
            achievement,
            value: Math.min(value, achievement.target),
            unlocked,
            revealed: unlocked || !achievement.secret,
            secretNumber: achievement.secret ? ++secrets : null,
            details: (unlocked && achievement.details?.(stats)) || null,
        };
    });
}
