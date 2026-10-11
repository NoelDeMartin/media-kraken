<template>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <InsightsCard :title="$t('insights.overview.movies')">
            <span class="text-2xl font-semibold text-gray-900 tabular-nums">
                {{ collection.movies.watched.length }}
            </span>
        </InsightsCard>
        <InsightsCard :title="$t('insights.overview.moviesWatchTime')">
            <span class="text-2xl font-semibold text-gray-900 tabular-nums">
                {{ formatHours(Math.round(watchTimeMinutes / 60)) }}
            </span>
        </InsightsCard>
        <InsightsCard :title="$t('insights.overview.shows')">
            <span class="text-2xl font-semibold text-gray-900 tabular-nums">
                {{ collection.shows.completed.length }}
            </span>
        </InsightsCard>
        <InsightsCard :title="$t('insights.overview.episodes')">
            <span class="text-2xl font-semibold text-gray-900 tabular-nums">
                {{ episodesWatched }}
            </span>
        </InsightsCard>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
        <InsightsCard>
            <DonutChart :label="$t('insights.overview.moviesChartLabel')" :slices="movieStatusSlices" />
        </InsightsCard>
        <InsightsCard>
            <DonutChart :label="$t('insights.overview.showsChartLabel')" :slices="showStatusSlices" />
        </InsightsCard>
    </div>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';
import { computed } from 'vue';

import { formatHours } from '@/lib/formatting';
import { SHOW_WATCHING_STATUSES } from '@/models/ShowWatching';
import type { ShowWatchingStatus } from '@/models/ShowWatching';
import { getEpisodesWatched } from '@/pages/insights/utils/insights';
import type { CollectionSummary } from '@/pages/insights/utils/insights';

const MOVIE_STATUS_COLORS = {
    watched: 'var(--color-green-500)',
    pending: 'var(--color-blue-500)',
};

const SHOW_STATUS_COLORS: Record<ShowWatchingStatus, string> = {
    watching: 'var(--color-blue-600)',
    completed: 'var(--color-green-500)',
    dropped: 'var(--color-gray-500)',
    pending: 'var(--color-blue-300)',
};

const { collection } = defineProps<{ collection: CollectionSummary }>();

const episodesWatched = computed(() => getEpisodesWatched(collection));

const watchTimeMinutes = computed(() =>
    collection.movies.watched.reduce((total, movie) => total + movie.runtimeMinutes, 0),
);

const movieStatusSlices = computed(() => [
    {
        label: translate('movies.watched'),
        value: collection.movies.watched.length,
        color: MOVIE_STATUS_COLORS.watched,
    },
    {
        label: translate('movies.pending'),
        value: collection.movies.pending.length,
        color: MOVIE_STATUS_COLORS.pending,
    },
]);

const showStatusSlices = computed(() =>
    (Object.keys(SHOW_WATCHING_STATUSES) as ShowWatchingStatus[]).map((status) => ({
        label: translate(`shows.statuses.${status}`),
        value: collection.shows[status].length,
        color: SHOW_STATUS_COLORS[status],
    })),
);
</script>
