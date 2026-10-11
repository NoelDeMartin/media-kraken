import { describe, expect, it } from 'vite-plus/test';

import { ACHIEVEMENTS, getAchievementsProgress } from './gamification';
import type { GamificationStats } from './gamification';

const EMPTY_STATS: GamificationStats = {
    watchedMovies: 0,
    watchedEpisodes: 0,
    completedShows: 0,
    droppedShows: 0,
    countries: 0,
    languages: 0,
    genres: 0,
    decades: 0,
    classicMovies: 0,
    sameYearMovies: 0,
    longestMovieMinutes: 0,
    busiestMonthEpisodes: 0,
    topDirectorMovies: 0,
    topActorTitles: 0,
};

describe('gamification', () => {
    it('locks every achievement without stats', () => {
        expect(getAchievementsProgress(EMPTY_STATS).some(({ unlocked }) => unlocked)).toBe(false);
    });

    it('unlocks achievements and caps progress', () => {
        const progress = getAchievementsProgress({ ...EMPTY_STATS, countries: 30, longestMovieMinutes: 200 });
        const globetrotter = progress.find(({ achievement }) => achievement.id === 'globetrotter');
        const marathon = progress.find(({ achievement }) => achievement.id === 'marathon');

        expect(globetrotter).toMatchObject({ unlocked: true, value: 25 });
        expect(marathon).toMatchObject({ unlocked: true, value: 1 });
        expect(progress.filter(({ unlocked }) => unlocked)).toHaveLength(2);
    });

    it('has unique achievement ids', () => {
        expect(new Set(ACHIEVEMENTS.map(({ id }) => id)).size).toBe(ACHIEVEMENTS.length);
    });
});
