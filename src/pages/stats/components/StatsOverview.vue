<template>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard :title="$t('stats.overview.moviesWatched')">
            <span class="text-2xl font-semibold text-gray-900 tabular-nums">
                {{ formatNumber(snapshot.movies.watched.length) }}
            </span>
        </StatsCard>
        <StatsCard :title="$t('stats.overview.moviesWatchTime')">
            <span class="text-2xl font-semibold text-gray-900 tabular-nums">
                {{ formatHours(Math.round(watchTimeMinutes / 60)) }}
            </span>
        </StatsCard>
        <StatsCard :title="$t('stats.overview.showsCompleted')">
            <span class="text-2xl font-semibold text-gray-900 tabular-nums">
                {{ formatNumber(snapshot.shows.completed.length) }}
            </span>
        </StatsCard>
        <StatsCard :title="$t('stats.overview.episodesWatched')">
            <span class="text-2xl font-semibold text-gray-900 tabular-nums">
                {{ formatNumber(episodesWatched) }}
            </span>
        </StatsCard>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
        <StatsCard :title="$t('stats.overview.moviesChart')" title-class="sr-only">
            <DonutChart :label="$t('stats.overview.moviesChartLabel')" :slices="movieStatusSlices" />
        </StatsCard>
        <StatsCard :title="$t('stats.overview.showsChart')" title-class="sr-only">
            <DonutChart :label="$t('stats.overview.showsChartLabel')" :slices="showStatusSlices" />
        </StatsCard>
    </div>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';
import { computed } from 'vue';

import { formatHours } from '@/lib/formatting';
import { formatNumber } from '@/lib/formatting';
import { SHOW_WATCHING_STATUSES } from '@/models/ShowWatching';
import type { ShowWatchingStatus } from '@/models/ShowWatching';
import { getEpisodesWatched } from '@/pages/stats/utils/snapshot';
import type { StatsSnapshot } from '@/pages/stats/utils/snapshot';

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

const { snapshot } = defineProps<{ snapshot: StatsSnapshot }>();

const episodesWatched = computed(() => getEpisodesWatched(snapshot));

const watchTimeMinutes = computed(() =>
    snapshot.movies.watched.reduce((total, movie) => total + movie.runtimeMinutes, 0),
);

const movieStatusSlices = computed(() => [
    {
        label: translate('movies.watched'),
        value: snapshot.movies.watched.length,
        color: MOVIE_STATUS_COLORS.watched,
    },
    {
        label: translate('movies.pending'),
        value: snapshot.movies.pending.length,
        color: MOVIE_STATUS_COLORS.pending,
    },
]);

const showStatusSlices = computed(() =>
    (Object.keys(SHOW_WATCHING_STATUSES) as ShowWatchingStatus[]).map((status) => ({
        label: translate(`shows.statuses.${status}`),
        value: snapshot.shows[status].length,
        color: SHOW_STATUS_COLORS[status],
    })),
);
</script>
