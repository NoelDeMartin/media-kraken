import { describe, expect, it } from 'vite-plus/test';

import { countryUrlFromCode } from '@/lib/countries';
import { minutesToISODuration } from '@/lib/durations';
import { genreUrl, type KnownGenreName } from '@/lib/genres';
import type { PersonCredit } from '@/models/Person';
import Movie from '@movies/models/Movie';
import WatchAction from '@movies/models/WatchAction';
import Show from '@shows/models/Show';
import ShowWatching, { SHOW_WATCHING_STATUSES } from '@shows/models/ShowWatching';

import { getAchievementsProgress } from './achievements';
import { getStatsSnapshot } from './snapshot';

const COUNTRY_CODES = [
    'AR',
    'AT',
    'AU',
    'BE',
    'BR',
    'CA',
    'CH',
    'CL',
    'CN',
    'CO',
    'CZ',
    'DE',
    'DK',
    'EG',
    'ES',
    'FI',
    'FR',
    'GB',
    'GR',
    'IE',
    'IN',
    'IT',
    'JP',
    'KR',
    'MX',
    'NL',
    'NO',
    'PL',
    'SE',
    'US',
];

function movie(
    attributes: {
        title?: string;
        genres?: KnownGenreName[];
        countryCodes?: string[];
        releaseDate?: Date;
        watchedAt?: Date;
        runtimeMinutes?: number;
        makers?: PersonCredit[];
    } = {},
): Movie {
    const instance = new Movie({
        title: attributes.title ?? 'Movie',
        releaseDate: attributes.releaseDate,
        genreUrls: attributes.genres?.map(genreUrl),
        countryUrls: attributes.countryCodes?.map(countryUrlFromCode).filter((url) => url !== null),
        duration: attributes.runtimeMinutes ? minutesToISODuration(attributes.runtimeMinutes) : undefined,
    });

    const url = instance.mintUrl();

    instance.relatedWatchActions.attach(new WatchAction({ object: url, endTime: attributes.watchedAt }));
    instance.getComputedAttribute('credits').setValue({ directors: attributes.makers ?? [], cast: [] });

    return instance;
}

function show(attributes: { seasonsWatched?: number } = {}): Show {
    const instance = new Show({ name: 'Show' });

    const url = instance.mintUrl();

    instance.relatedWatching.attach(new ShowWatching({ showUrl: url, statusUrl: SHOW_WATCHING_STATUSES.watching }));
    instance.getComputedAttribute('credits').setValue({ creators: [], cast: [] });
    instance.getComputedAttribute('watchedEpisodes').setValue({ episodes: 0, seasons: attributes.seasonsWatched ?? 0 });

    return instance;
}

const EMPTY_COLLECTION = getStatsSnapshot([], []);

function getProgress(achievementId: string, movies: Movie[]) {
    return getAchievementsProgress(getStatsSnapshot(movies, [])).find(
        ({ achievement }) => achievement.id === achievementId,
    );
}

describe('achievements', () => {
    it('locks every achievement without stats', () => {
        expect(getAchievementsProgress(EMPTY_COLLECTION).some(({ unlocked }) => unlocked)).toBe(false);
    });

    it('unlocks achievements and caps progress', () => {
        const progress = getAchievementsProgress(
            getStatsSnapshot(
                [
                    ...Array.from({ length: 30 }, (_, index) =>
                        movie({ countryCodes: [COUNTRY_CODES[index] as string] }),
                    ),
                    movie({ runtimeMinutes: 200 }),
                ],
                [],
            ),
        );
        const globetrotter = progress.find(({ achievement }) => achievement.id === 'globetrotter');
        const attentionSpan = progress.find(({ achievement }) => achievement.id === 'attentionSpan');

        expect(globetrotter).toMatchObject({ unlocked: true, value: 25 });
        expect(attentionSpan).toMatchObject({ unlocked: true, value: 1 });
        expect(progress.filter(({ unlocked }) => unlocked)).toHaveLength(2);
    });

    it('hides secret achievements until unlocked', () => {
        const isRevealed = (movies: Movie[]) =>
            getAchievementsProgress(getStatsSnapshot(movies, [])).find(
                ({ achievement }) => achievement.id === 'attentionSpan',
            )?.revealed;

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
            getAchievementsProgress(getStatsSnapshot([], [show({ seasonsWatched: seasons })])).find(
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
        const horror: KnownGenreName[] = ['Horror'];
        const horrorMovies = (count: number, watchedAt: Date) =>
            Array.from({ length: count }, () => movie({ genres: horror, watchedAt }));

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

    it('counts christmas movies watched in the same December of a single year', () => {
        const christmasMovies = (count: number, watchedAt: Date) =>
            Array.from({ length: count }, () => movie({ genres: ['Christmas'], watchedAt }));

        expect(
            getProgress('jingleBells', [
                ...christmasMovies(9, new Date(2024, 11, 5)),
                ...christmasMovies(1, new Date(2023, 11, 5)),
                movie({ genres: ['Animation'], watchedAt: new Date(2024, 11, 10) }),
            ]),
        ).toMatchObject({ unlocked: false, value: 9 });
        expect(getProgress('jingleBells', christmasMovies(10, new Date(2024, 11, 24)))?.unlocked).toBe(true);
    });

    it('ignores watching dates from days with implausibly many movies', () => {
        const director = { name: 'Peter Jackson', tmdbId: 108 };
        const importedAt = new Date(2024, 9, 31);
        const importedMovies = [
            movie({ makers: [director], genres: ['Horror'], watchedAt: importedAt }),
            movie({ makers: [director], genres: ['Horror'], watchedAt: importedAt }),
            movie({ makers: [director], genres: ['Horror'], watchedAt: importedAt }),
            movie({ genres: ['Horror'], releaseDate: new Date('2024-12-01'), watchedAt: importedAt }),
            ...Array.from({ length: 6 }, () => movie({ genres: ['Horror'], watchedAt: importedAt })),
        ];
        const longDay = Array.from({ length: 10 }, () =>
            movie({ genres: ['Christmas'], runtimeMinutes: 150, watchedAt: new Date(2024, 11, 24) }),
        );

        expect(getProgress('marathon', importedMovies)?.unlocked).toBe(true);
        expect(getProgress('premiere', importedMovies)?.unlocked).toBe(true);
        expect(getProgress('spookySeason', importedMovies)?.unlocked).toBe(true);

        importedMovies.push(movie({ watchedAt: importedAt }));

        expect(getProgress('marathon', importedMovies)?.unlocked).toBe(false);
        expect(getProgress('premiere', importedMovies)?.unlocked).toBe(false);
        expect(getProgress('spookySeason', importedMovies)).toMatchObject({ unlocked: false, value: 0 });
        expect(getProgress('jingleBells', longDay)).toMatchObject({ unlocked: false, value: 0 });
    });
});
