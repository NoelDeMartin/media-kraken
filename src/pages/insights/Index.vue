<template>
    <Page>
        <PageTitle class="sr-only">{{ $t('insights.title') }}</PageTitle>

        <div v-if="loading" class="flex items-center justify-center py-16">
            <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
        </div>

        <div v-else class="flex flex-col gap-4">
            <InsightsRankAndTraits :collection />
            <InsightsOverview :collection />
            <InsightsMostWatched :collection :credits-loaded />
            <InsightsAchievements :collection />
        </div>
    </Page>
</template>

<script setup lang="ts">
import { useModels } from '@aerogel/plugin-solid';
import { computed, ref, watch } from 'vue';

import { useWatchedEpisodesByMonth } from '@/lib/composition/shows';
import Movie from '@/models/Movie';
import Show from '@/models/Show';
import { getCollectionSummary } from '@/pages/insights/utils/insights';

const { models: movies, loading: loadingMovies } = useModels(Movie);
const { models: shows, loading: loadingShows } = useModels(Show);
const loading = computed(() => loadingMovies.value || loadingShows.value);
const creditsLoaded = ref(false);
const watchedEpisodesByMonth = useWatchedEpisodesByMonth(shows);

// Credits are cached computed attributes, which aren't reactive; so we depend on this flag instead.
const collection = computed(() =>
    getCollectionSummary(movies.value, shows.value, {
        credits: creditsLoaded.value,
        watchedEpisodesByMonth: watchedEpisodesByMonth.value,
    }),
);

watch(
    loading,
    async (isLoading) => {
        if (isLoading) {
            return;
        }

        await Promise.all([
            ...movies.value.filter((movie) => !movie.credits.value).map((movie) => movie.credits.updateValue()),
            ...shows.value.filter((show) => !show.credits.value).map((show) => show.credits.updateValue()),
        ]);

        creditsLoaded.value = true;
    },
    { immediate: true },
);
</script>
