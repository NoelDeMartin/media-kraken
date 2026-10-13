import { describe, expect, it } from 'vite-plus/test';

import { TMDB_GENRES } from '@/lib/tmdb';
import { getMediaStats } from '@/pages/stats/utils/snapshot';
import type { StatsSnapshot, MovieSnapshot, ShowSnapshot } from '@/pages/stats/utils/snapshot';

import { getAchievementsProgress } from './achievements';

function movie(attributes: Partial<MovieSnapshot> = {}): MovieSnapshot {
    return {
        title: 'Movie',
        genreIds: [],
        countryCodes: [],
        languages: [],
        releaseYear: null,
        releaseDate: null,
        makers: [],
        cast: [],
        watched: true,
        watchedAt: null,
        runtimeMinutes: 0,
        ...attributes,
    };
}

function show(attributes: Partial<ShowSnapshot> = {}): ShowSnapshot {
    return {
        name: 'Show',
        genreIds: [],
        countryCodes: [],
        languages: [],
        releaseYear: null,
        makers: [],
        cast: [],
        watchingStatus: 'watching',
        episodesWatched: 0,
        episodesWatchedByMonth: {},
        seasonsWatched: 0,
        ...attributes,
    };
}

function snapshot({ movies = [], shows = [] }: { movies?: MovieSnapshot[]; shows?: ShowSnapshot[] } = {}) {
    return {
        movies: { watched: movies, pending: [] },
        shows: { watching: shows, pending: [], dropped: [], completed: [] },
        mediaStats: {
            all: getMediaStats([...movies, ...shows]),
            movies: getMediaStats(movies),
            shows: getMediaStats(shows),
        },
        loadingCredits: false,
    } satisfies StatsSnapshot;
}

const EMPTY_COLLECTION = snapshot();

function getProgress(achievementId: string, movies: MovieSnapshot[]) {
    return getAchievementsProgress(snapshot({ movies })).find(({ achievement }) => achievement.id === achievementId);
}

describe('achievements', () => {
    it('locks every achievement without stats', () => {
        expect(getAchievementsProgress(EMPTY_COLLECTION).some(({ unlocked }) => unlocked)).toBe(false);
    });

    it('unlocks achievements and caps progress', () => {
        const progress = getAchievementsProgress(
            snapshot({
                movies: [
                    ...Array.from({ length: 30 }, (_, index) => movie({ countryCodes: [`C${index}`] })),
                    movie({ runtimeMinutes: 200 }),
                ],
            }),
        );
        const globetrotter = progress.find(({ achievement }) => achievement.id === 'globetrotter');
        const attentionSpan = progress.find(({ achievement }) => achievement.id === 'attentionSpan');

        expect(globetrotter).toMatchObject({ unlocked: true, value: 25 });
        expect(attentionSpan).toMatchObject({ unlocked: true, value: 1 });
        expect(progress.filter(({ unlocked }) => unlocked)).toHaveLength(2);
    });

    it('hides secret achievements until unlocked', () => {
        const isRevealed = (movies: MovieSnapshot[]) =>
            getAchievementsProgress(snapshot({ movies })).find(({ achievement }) => achievement.id === 'attentionSpan')
                ?.revealed;

        expect(isRevealed([])).toBe(false);
        expect(isRevealed([movie({ runtimeMinutes: 200 })])).toBe(true);
        expect(
            getAchievementsProgress(EMPTY_COLLECTION)
                .filter(({ achievement }) => !achievement.secret)
                .every(({ revealed }) => revealed),
        ).toBe(true);
    });

    it('unlocks committed fan only after watching more than 10 seasons of a show', () => {
        const isUnlocked = (seasons: number) =>
            getAchievementsProgress(snapshot({ shows: [show({ seasonsWatched: seasons })] })).find(
                ({ achievement }) => achievement.id === 'committedFan',
            )?.unlocked;

        expect(isUnlocked(10)).toBe(false);
        expect(isUnlocked(11)).toBe(true);
    });

    it('numbers secret achievements', () => {
        const progress = getAchievementsProgress(EMPTY_COLLECTION);

        expect(progress.filter(({ secretNumber }) => secretNumber).map(({ secretNumber }) => secretNumber)).toEqual([
            1, 2, 3, 4, 5, 6,
        ]);
        expect(
            progress
                .filter(({ achievement }) => !achievement.secret)
                .every(({ secretNumber }) => secretNumber === null),
        ).toBe(true);
    });

    it('unlocks premiere when a movie is watched on or before its release day', () => {
        const releaseDate = new Date('2024-03-01');

        expect(getProgress('premiere', [movie({ releaseDate, watchedAt: new Date(2024, 1, 20) })])?.unlocked).toBe(
            true,
        );
        expect(
            getProgress('premiere', [movie({ releaseDate, watchedAt: new Date(2024, 2, 1, 23, 30) })])?.unlocked,
        ).toBe(true);
        expect(getProgress('premiere', [movie({ releaseDate, watchedAt: new Date(2024, 2, 2) })])?.unlocked).toBe(
            false,
        );
    });

    it('unlocks marathon after watching 3 movies from the same director on the same day', () => {
        const director = { name: 'Peter Jackson', tmdbId: 108 };
        const other = { name: 'Someone Else', tmdbId: 1 };
        const movies = [
            movie({ title: 'Fellowship', makers: [director], watchedAt: new Date(2024, 0, 1, 10) }),
            movie({ title: 'Two Towers', makers: [director], watchedAt: new Date(2024, 0, 1, 15) }),
            movie({ title: 'Other', makers: [other], watchedAt: new Date(2024, 0, 1) }),
        ];

        expect(
            getProgress('marathon', [
                ...movies,
                movie({ title: 'Return', makers: [director], watchedAt: new Date(2024, 0, 2) }),
            ])?.unlocked,
        ).toBe(false);
        expect(
            getProgress('marathon', [
                ...movies,
                movie({ title: 'Return', makers: [director], watchedAt: new Date(2024, 0, 1, 21) }),
            ])?.unlocked,
        ).toBe(true);
    });

    it('counts horror movies watched in the same October of a single year', () => {
        const horror = [TMDB_GENRES.Horror];
        const horrorMovies = (count: number, watchedAt: Date) =>
            Array.from({ length: count }, () => movie({ genreIds: horror, watchedAt }));

        expect(
            getProgress('spookySeason', [
                ...horrorMovies(9, new Date(2024, 9, 5)),
                ...horrorMovies(1, new Date(2023, 9, 5)),
                ...horrorMovies(1, new Date(2024, 10, 1)),
                movie({ watchedAt: new Date(2024, 9, 10) }),
            ]),
        ).toMatchObject({ unlocked: false, value: 9 });
        expect(getProgress('spookySeason', horrorMovies(10, new Date(2024, 9, 31)))?.unlocked).toBe(true);
    });
});
