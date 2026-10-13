<template>
    <section>
        <div class="flex flex-wrap items-center justify-between gap-4">
            <SectionTitle>{{ $t('stats.mostWatched.title') }}</SectionTitle>
            <RadioTabs
                v-model="mediaFilter"
                :options="mediaFilterOptions"
                :aria-label="$t('stats.mostWatched.filter')"
            />
        </div>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
            <StatsCard
                v-for="chart in charts"
                :key="chart.title"
                :title="chart.title"
                :title-level="3"
                title-class="mb-4 text-lg font-medium text-gray-900"
            >
                <BarChart v-if="chart.entries.length" :entries="chart.entries" />
                <p v-else class="text-gray-500">
                    {{ $t('stats.emptyChart') }}
                </p>
            </StatsCard>
        </div>
    </section>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';
import { computed, ref } from 'vue';

import { formatCountry, formatLanguage, formatNumber } from '@/lib/formatting';
import { MediaTypes } from '@/pages/stats/utils/snapshot';
import type { StatsSnapshot, MediaType, MediaStatsEntry, ChartEntry } from '@/pages/stats/utils/snapshot';
import TMDB from '@/services/TMDB';

const TOP_LIMIT = 10;

const { snapshot } = defineProps<{ snapshot: StatsSnapshot }>();
const mediaFilter = ref<MediaType>('all');

const stats = computed(() => snapshot.mediaStats[mediaFilter.value]);

const mediaFilterOptions = computed(() =>
    MediaTypes.map((filter) => ({
        value: filter,
        label: `${translate(`stats.mostWatched.filters.${filter}`)} (${formatNumber(snapshot.mediaStats[filter].titles)})`,
    })),
);

const charts = computed(() => [
    {
        title: translate('stats.mostWatched.genres'),
        entries: labelled(stats.value.genres.slice(0, TOP_LIMIT), (id) => TMDB.translateGenre(id) ?? String(id)),
    },
    {
        title: translate('stats.mostWatched.countries'),
        entries: labelled(stats.value.countries.slice(0, TOP_LIMIT), formatCountry),
    },
    {
        title: translate(`stats.mostWatched.makers.${mediaFilter.value}`),
        entries: labelled(stats.value.makers.slice(0, TOP_LIMIT), (person) => person.name),
    },
    {
        title: translate('stats.mostWatched.actors'),
        entries: labelled(stats.value.cast.slice(0, TOP_LIMIT), (person) => person.name),
    },
    {
        title: translate('stats.mostWatched.languages'),
        entries: labelled(stats.value.languages.slice(0, TOP_LIMIT), formatLanguage),
    },
    {
        title: translate('stats.mostWatched.decades'),
        entries: labelled(stats.value.decades.slice(0, TOP_LIMIT), (decade) => `${decade}s`),
    },
]);

function labelled<T>(entries: MediaStatsEntry<T>[], render: (key: T) => string): ChartEntry[] {
    return entries.map(({ key, count }) => ({ key: String(key), label: render(key), value: count }));
}
</script>
