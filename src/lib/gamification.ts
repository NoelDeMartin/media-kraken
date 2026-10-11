import type { Component } from 'vue';
import IconCalendar from '~icons/ph/calendar-star-fill';
import IconFilmReel from '~icons/ph/film-reel-fill';
import IconFilmSlate from '~icons/ph/film-slate-fill';
import IconFire from '~icons/ph/fire-fill';
import IconFlag from '~icons/ph/flag-checkered-fill';
import IconGlobe from '~icons/ph/globe-hemisphere-west-fill';
import IconHeart from '~icons/ph/heart-fill';
import IconHourglass from '~icons/ph/hourglass-medium-fill';
import IconMask from '~icons/ph/mask-happy-fill';
import IconRun from '~icons/ph/person-simple-run-fill';
import IconSparkle from '~icons/ph/sparkle-fill';
import IconTelevision from '~icons/ph/television-simple-fill';
import IconThumbsDown from '~icons/ph/thumbs-down-fill';
import IconTranslate from '~icons/ph/translate-fill';

export interface GamificationStats {
    watchedMovies: number;
    watchedEpisodes: number;
    completedShows: number;
    droppedShows: number;
    countries: number;
    languages: number;
    genres: number;
    decades: number;
    classicMovies: number;
    sameYearMovies: number;
    longestMovieMinutes: number;
    busiestMonthEpisodes: number;
    topDirectorMovies: number;
    topActorTitles: number;
}

export interface Achievement {
    id: string;
    icon: Component;
    target: number;
    value: (stats: GamificationStats) => number;
}

export interface AchievementProgress {
    achievement: Achievement;
    value: number;
    unlocked: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'globetrotter', icon: IconGlobe, target: 25, value: (stats) => stats.countries },
    { id: 'polyglot', icon: IconTranslate, target: 10, value: (stats) => stats.languages },
    { id: 'genreHopper', icon: IconMask, target: 15, value: (stats) => stats.genres },
    { id: 'timeTraveler', icon: IconHourglass, target: 8, value: (stats) => stats.decades },
    { id: 'classics', icon: IconFilmReel, target: 25, value: (stats) => stats.classicMovies },
    { id: 'firstInLine', icon: IconSparkle, target: 25, value: (stats) => stats.sameYearMovies },
    { id: 'marathon', icon: IconRun, target: 1, value: (stats) => (stats.longestMovieMinutes >= 180 ? 1 : 0) },
    { id: 'auteur', icon: IconFilmSlate, target: 10, value: (stats) => stats.topDirectorMovies },
    { id: 'superfan', icon: IconHeart, target: 25, value: (stats) => stats.topActorTitles },
    { id: 'completionist', icon: IconFlag, target: 10, value: (stats) => stats.completedShows },
    { id: 'bingeMonth', icon: IconFire, target: 100, value: (stats) => stats.busiestMonthEpisodes },
    { id: 'seasoned', icon: IconTelevision, target: 1000, value: (stats) => stats.watchedEpisodes },
    { id: 'tough', icon: IconThumbsDown, target: 10, value: (stats) => stats.droppedShows },
    { id: 'anniversary', icon: IconCalendar, target: 365, value: (stats) => stats.watchedMovies },
];

export function getAchievementsProgress(stats: GamificationStats): AchievementProgress[] {
    return ACHIEVEMENTS.map((achievement) => {
        const value = achievement.value(stats);

        return { achievement, value: Math.min(value, achievement.target), unlocked: value >= achievement.target };
    });
}
