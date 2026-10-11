<template>
    <section>
        <h2 class="text-2xl font-semibold">{{ $t('insights.achievements.title') }}</h2>
        <p class="text-sm text-gray-600">
            {{
                $t('insights.achievements.unlocked', {
                    unlocked: formatNumber(unlockedAchievements),
                    total: formatNumber(achievements.length),
                })
            }}
        </p>
        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AchievementBadge
                v-for="achievement in achievements"
                :key="achievement.achievement.id"
                :progress="achievement"
            />
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { formatNumber } from '@/lib/formatting';
import { getAchievementsProgress } from '@/lib/gamification';
import { getEpisodesWatched, getEpisodesWatchedByMonth } from '@/pages/insights/utils/insights';
import type { CollectionSummary } from '@/pages/insights/utils/insights';

const { collection } = defineProps<{ collection: CollectionSummary }>();

const achievements = computed(() => {
    const watchedMovies = collection.movies.watched;
    const { all, movies } = collection.taste;

    return getAchievementsProgress({
        watchedMovies: watchedMovies.length,
        watchedEpisodes: getEpisodesWatched(collection),
        completedShows: collection.shows.completed.length,
        droppedShows: collection.shows.dropped.length,
        countries: all.countries.length,
        languages: all.languages.length,
        genres: all.genres.length,
        decades: all.decades.size,
        classicMovies: watchedMovies.filter((movie) => movie.releaseYear && movie.releaseYear < 1960).length,
        sameYearMovies: watchedMovies.filter(
            (movie) => movie.releaseYear && movie.watchedAt?.getFullYear() === movie.releaseYear,
        ).length,
        longestMovieMinutes: Math.max(0, ...watchedMovies.map((movie) => movie.runtimeMinutes)),
        busiestMonthEpisodes: Math.max(0, ...getEpisodesWatchedByMonth(collection).values()),
        topDirectorMovies: movies.makers[0]?.count ?? 0,
        topActorTitles: all.cast[0]?.count ?? 0,
    });
});
const unlockedAchievements = computed(() => achievements.value.filter(({ unlocked }) => unlocked).length);
</script>
