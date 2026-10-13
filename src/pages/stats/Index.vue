<template>
    <Page>
        <PageTitle class="sr-only">{{ $t('stats.title') }}</PageTitle>

        <div v-if="!snapshot" class="flex items-center justify-center py-16">
            <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
        </div>

        <div v-else class="flex flex-col gap-4">
            <StatsRankAndTraits :snapshot />
            <StatsOverview :snapshot />
            <StatsMostWatched :snapshot />
            <StatsAchievements :snapshot />
        </div>
    </Page>
</template>

<script setup lang="ts">
import { computedModels, useModels } from '@aerogel/plugin-solid';
import { computed } from 'vue';

import { useWatchedEpisodes } from '@/lib/composition/shows';
import Movie from '@/models/Movie';
import Show from '@/models/Show';
import { getStatsSnapshot } from '@/pages/stats/utils/snapshot';

const { models: movies, loading: loadingMovies } = useModels(Movie);
const { models: shows, loading: loadingShows } = useModels(Show);
const watchedEpisodes = useWatchedEpisodes(shows);
const loading = computed(() => loadingMovies.value || loadingShows.value);
const snapshot = computedModels(
    [Movie, Show],
    () =>
        loading.value ? null : getStatsSnapshot(movies.value, shows.value, { watchedEpisodes: watchedEpisodes.value }),
    { watch: ['credits'], cache: 'stats' },
);
</script>
