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

import { formatHours, formatNumber } from '@/lib/formatting';
import { getEpisodesWatched } from '@/pages/stats/utils/snapshot';
import type { StatsSnapshot } from '@/pages/stats/utils/snapshot';
import { MOVIE_WATCHING_STATUSES } from '@movies/models/WatchAction';
import type { MovieWatchingStatus } from '@movies/models/WatchAction';
import { SHOW_WATCHING_STATUSES } from '@shows/models/ShowWatching';
import type { ShowWatchingStatus } from '@shows/models/ShowWatching';

const MOVIE_STATUS_COLORS: Record<MovieWatchingStatus, string> = {
    watched: 'var(--color-green-500)',
    dropped: 'var(--color-gray-500)',
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

const movieStatusSlices = computed(() =>
    (Object.keys(MOVIE_WATCHING_STATUSES) as MovieWatchingStatus[]).map((status) => ({
        label: translate(`movies.${status}`),
        value: snapshot.movies[status].length,
        color: MOVIE_STATUS_COLORS[status],
    })),
);

const showStatusSlices = computed(() =>
    (Object.keys(SHOW_WATCHING_STATUSES) as ShowWatchingStatus[]).map((status) => ({
        label: translate(`shows.statuses.${status}`),
        value: snapshot.shows[status].length,
        color: SHOW_STATUS_COLORS[status],
    })),
);
</script>
