<template>
    <Page :title="$t('stats.title')">
        <div v-if="loading" class="flex items-center justify-center py-16">
            <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
        </div>
        <div v-else class="mt-4 flex flex-col gap-10">
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatTile :label="$t('stats.tiles.watched')" :value="watchedMovies.length" />
                <StatTile :label="$t('stats.tiles.watchTime')" :value="formatDuration({ minutes: watchTimeMinutes })" />
                <StatTile
                    :label="$t('stats.tiles.averageRuntime')"
                    :value="averageRuntime ? formatDuration({ minutes: averageRuntime }) : '-'"
                />
                <StatTile
                    :label="$t('stats.tiles.episodes')"
                    :value="episodesLoaded ? watchedEpisodes.total : $t('stats.loading')"
                />
            </div>

            <div class="grid gap-10 md:grid-cols-2">
                <section>
                    <h2 class="mb-4 text-lg font-semibold">{{ $t('stats.movies') }}</h2>
                    <DonutChart
                        :total-label="$t('stats.moviesTotal')"
                        :slices="[
                            {
                                label: $t('stats.watched'),
                                value: watchedMovies.length,
                                color: MOVIE_STATUS_COLORS.watched,
                            },
                            {
                                label: $t('stats.pending'),
                                value: movies.length - watchedMovies.length,
                                color: MOVIE_STATUS_COLORS.pending,
                            },
                        ]"
                    />
                </section>
                <section>
                    <h2 class="mb-4 text-lg font-semibold">{{ $t('stats.shows') }}</h2>
                    <DonutChart :total-label="$t('stats.showsTotal')" :slices="showStatusSlices" />
                </section>
            </div>

            <section>
                <h2 class="mb-4 text-lg font-semibold">{{ $t('stats.watchedByYear') }}</h2>
                <ColumnChart v-if="watchedByYear.length" :entries="watchedByYear" />
                <p v-else class="text-gray-500">{{ $t('stats.empty') }}</p>
            </section>

            <section>
                <h2 class="mb-4 text-lg font-semibold">{{ $t('stats.episodesWatchedByYear') }}</h2>
                <ColumnChart v-if="episodesWatchedByYear.length" :entries="episodesWatchedByYear" />
                <p v-else-if="episodesLoaded" class="text-gray-500">{{ $t('stats.empty') }}</p>
                <p v-if="!episodesLoaded" class="mt-2 text-sm text-gray-500">
                    {{ $t('stats.loadingEpisodes', { loaded: watchedEpisodesByMonth.size, total: shows.length }) }}
                </p>
                <p v-else-if="watchedEpisodes.unknown" class="mt-2 text-sm text-gray-500">
                    {{ $t('stats.episodesWithoutDate', { count: watchedEpisodes.unknown }) }}
                </p>
            </section>

            <div class="grid gap-10 md:grid-cols-2">
                <section v-for="chart in barCharts" :key="chart.title">
                    <h2 class="mb-4 text-lg font-semibold">{{ chart.title }}</h2>
                    <BarChart v-if="chart.entries.length" :entries="chart.entries" />
                    <p v-else class="text-gray-500">{{ chart.emptyMessage ?? $t('stats.empty') }}</p>
                </section>
            </div>

            <section>
                <h2 class="mb-4 text-lg font-semibold">{{ $t('stats.releaseDecades') }}</h2>
                <ColumnChart v-if="releaseDecades.length" :entries="releaseDecades" />
                <p v-else class="text-gray-500">{{ $t('stats.empty') }}</p>
            </section>

            <section v-if="records.length">
                <h2 class="mb-4 text-lg font-semibold">{{ $t('stats.records.title') }}</h2>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <StatTile v-for="record in records" :key="record.label" :label="record.label" :value="record.value">
                        <Link :to="record.movie.route" class="hover:underline">{{ record.movie.title }}</Link>
                    </StatTile>
                </div>
            </section>
        </div>
    </Page>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';
import { useModels } from '@aerogel/plugin-solid';
import { arraySorted, isTruthy } from '@noeldemartin/utils';
import { computed, ref, watch } from 'vue';

import { useWatchedEpisodesByMonth } from '@/lib/composition/shows';
import { formatCountry, formatDuration, formatLanguage } from '@/lib/formatting';
import { countEntries, topEntries } from '@/lib/stats';
import Movie from '@/models/Movie';
import Show from '@/models/Show';
import { SHOW_WATCHING_STATUSES } from '@/models/ShowWatching';
import type { ShowWatchingStatus } from '@/models/ShowWatching';
import TMDB from '@/services/TMDB';

// Same hues as the ones used in movie and show badges.
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

const { models: movies, loading: loadingMovies } = useModels(Movie);
const { models: shows, loading: loadingShows } = useModels(Show);
const loading = computed(() => loadingMovies.value || loadingShows.value);
const relationsLoaded = ref(false);
const watchedMovies = computed(() => movies.value.filter((movie) => movie.watched));
const runtimes = computed(() => watchedMovies.value.map((movie) => movie.runtimeMinutes).filter(isTruthy));
const watchTimeMinutes = computed(() => runtimes.value.reduce((total, minutes) => total + minutes, 0));
const averageRuntime = computed(() =>
    runtimes.value.length ? Math.round(watchTimeMinutes.value / runtimes.value.length) : null,
);

const showStatusSlices = computed(() => {
    const counts = countEntries(shows.value.map((show) => show.watchingStatus));

    return (Object.keys(SHOW_WATCHING_STATUSES) as ShowWatchingStatus[]).map((status) => ({
        label: translate(`stats.showStatuses.${status}`),
        value: counts.get(status) ?? 0,
        color: SHOW_STATUS_COLORS[status],
    }));
});

const watchedByYear = computed(() =>
    continuousSeries(
        countEntries(watchedMovies.value.map((movie) => movie.watchedAt?.getFullYear()).filter(isTruthy)),
        1,
        String,
    ),
);

const watchedEpisodesByMonth = useWatchedEpisodesByMonth(shows);
const episodesLoaded = computed(() => watchedEpisodesByMonth.value.size >= shows.value.length);
const watchedEpisodes = computed(() => {
    const byYear = new Map<number, number>();
    let total = 0;
    let unknown = 0;

    for (const months of watchedEpisodesByMonth.value.values()) {
        for (const [month, count] of Object.entries(months)) {
            total += count;

            if (month === 'unknown') {
                unknown += count;

                continue;
            }

            const year = Number(month.slice(0, 4));

            byYear.set(year, (byYear.get(year) ?? 0) + count);
        }
    }

    return { byYear, total, unknown };
});
const episodesWatchedByYear = computed(() => continuousSeries(watchedEpisodes.value.byYear, 1, String));

const releaseDecades = computed(() =>
    continuousSeries(
        countEntries(
            watchedMovies.value
                .map((movie) => movie.releaseYear && Math.floor(movie.releaseYear / 10) * 10)
                .filter(isTruthy),
        ),
        10,
        (decade) => `${decade}s`,
    ),
);

const barCharts = computed(() => [
    {
        title: translate('stats.topGenres'),
        entries: labelled(
            topEntries(watchedMovies.value.flatMap((movie) => movie.genreIds)),
            (id) => TMDB.translateGenre(id) ?? String(id),
        ),
    },
    {
        title: translate('stats.topCountries'),
        entries: labelled(topEntries(watchedMovies.value.flatMap((movie) => movie.countryCodes)), formatCountry),
    },
    {
        title: translate('stats.topDirectors'),
        emptyMessage: relationsLoaded.value ? undefined : translate('stats.loading'),
        entries: labelled(
            topEntries(watchedMovies.value.flatMap((movie) => movie.directors?.map(({ name }) => name) ?? [])),
            (name) => name,
        ),
    },
    {
        title: translate('stats.topActors'),
        emptyMessage: relationsLoaded.value ? undefined : translate('stats.loading'),
        entries: labelled(
            topEntries(
                watchedMovies.value.flatMap(
                    (movie) => movie.cast?.map(({ actor }) => actor?.name).filter(isTruthy) ?? [],
                ),
            ),
            (name) => name,
        ),
    },
    {
        title: translate('stats.topLanguages'),
        entries: labelled(topEntries(watchedMovies.value.flatMap((movie) => movie.languages)), formatLanguage),
    },
]);

const records = computed(() => {
    const byRelease = arraySorted(
        watchedMovies.value.filter((movie) => movie.releaseDate),
        'releaseDate',
        'asc',
    );
    const byRuntime = arraySorted(
        watchedMovies.value.filter((movie) => movie.runtimeMinutes),
        'runtimeMinutes',
        'asc',
    );
    const oldest = byRelease[0];
    const newest = byRelease[byRelease.length - 1];
    const shortest = byRuntime[0];
    const longest = byRuntime[byRuntime.length - 1];

    return [
        oldest && { label: translate('stats.records.oldest'), value: oldest.releaseYear ?? '-', movie: oldest },
        newest && { label: translate('stats.records.newest'), value: newest.releaseYear ?? '-', movie: newest },
        longest && {
            label: translate('stats.records.longest'),
            value: formatDuration({ minutes: longest.runtimeMinutes ?? 0 }),
            movie: longest,
        },
        shortest && {
            label: translate('stats.records.shortest'),
            value: formatDuration({ minutes: shortest.runtimeMinutes ?? 0 }),
            movie: shortest,
        },
    ].filter(isTruthy);
});

function labelled<T>(entries: { key: T; count: number }[], render: (key: T) => string) {
    return entries.map(({ key, count }) => ({ label: render(key), value: count }));
}

function continuousSeries(counts: Map<number, number>, step: number, render: (value: number) => string) {
    if (counts.size === 0) {
        return [];
    }

    const values = Array.from(counts.keys());
    const series = [];

    for (let value = Math.min(...values); value <= Math.max(...values); value += step) {
        series.push({ label: render(value), value: counts.get(value) ?? 0 });
    }

    return series;
}

watch(
    loadingMovies,
    async (isLoading) => {
        if (isLoading) {
            return;
        }

        await Promise.all(movies.value.map((movie) => movie.loadAllRelationsIfUnloaded()));

        relationsLoaded.value = true;
    },
    { immediate: true },
);
</script>
