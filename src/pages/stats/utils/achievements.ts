import { translate } from '@aerogel/core';
import { arraySorted, isTruthy } from '@noeldemartin/utils';
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

import { arrayMax } from '@/lib/arrays';
import { formatDuration, formatList, formatNumber } from '@/lib/formatting';
import { personFilterKey } from '@/lib/media';
import { countEntries } from '@/lib/stats';
import { TMDB_GENRES } from '@/lib/tmdb';
import { getAllShows, getEpisodesWatched } from '@/pages/stats/utils/snapshot';
import type { MovieSnapshot, StatsSnapshot } from '@/pages/stats/utils/snapshot';

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
    mostFamilyMoviesInADecember: number;
}

export interface AchievementProgress {
    achievement: Achievement;
    value: number;
    unlocked: boolean;
    revealed: boolean;
    secretNumber: number | null;
    details: string | null;
}

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
                      titles: formatList(stats.marathonMovieTitles),
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
        value: (stats) => stats.mostFamilyMoviesInADecember,
    },
];

function releaseDayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function watchedDayKey(date: Date): string {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((n) => String(n).padStart(2, '0')).join('-');
}

function getAchievementsStats(snapshot: StatsSnapshot): AchievementsStats {
    const watchedMovies = snapshot.movies.watched;
    const { all } = snapshot.mediaStats;
    const longestMovie = arrayMax(watchedMovies, (movie) => movie.runtimeMinutes);
    const mostWatchedShow = arrayMax(getAllShows(snapshot), (show) => show.seasonsWatched);
    const marathon = arraySorted(getBiggestMakerMarathon(watchedMovies), 'watchedAt', 'asc');

    return {
        watchedMovies: watchedMovies.length,
        watchedEpisodes: getEpisodesWatched(snapshot),
        countries: all.countries.length,
        languages: all.languages.length,
        genres: all.genres.length,
        decades: all.decades.size,
        longestMovieMinutes: longestMovie?.runtimeMinutes ?? 0,
        longestMovieTitle: longestMovie?.title ?? null,
        mostSeasonsWatched: mostWatchedShow?.seasonsWatched ?? 0,
        mostSeasonsWatchedShowName: mostWatchedShow?.name ?? null,
        mostSameDirectorMoviesInADay: marathon.length,
        marathonMovieTitles: marathon.map((movie) => movie.title),
        premieredMovieTitle: getFirstPremieredMovie(watchedMovies)?.title ?? null,
        mostHorrorMoviesInAnOctober: getMostGenreMoviesInAMonth(watchedMovies, TMDB_GENRES.Horror, 9),
        mostFamilyMoviesInADecember: getMostGenreMoviesInAMonth(watchedMovies, TMDB_GENRES.Family, 11),
    };
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

function getMostGenreMoviesInAMonth(movies: MovieSnapshot[], genreId: number, month: number): number {
    const years = movies
        .filter((movie) => movie.watchedAt?.getMonth() === month && movie.genreIds.includes(genreId))
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
