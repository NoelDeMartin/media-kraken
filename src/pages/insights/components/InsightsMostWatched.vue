<template>
    <section>
        <div class="flex flex-wrap items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">{{ $t('insights.mostWatched.title') }}</h2>
            <div
                class="flex items-center gap-1 rounded-md bg-white p-1 shadow-sm"
                role="group"
                :aria-label="$t('insights.mostWatched.filter')"
            >
                <Button
                    v-for="option in MEDIA_FILTERS"
                    :key="option"
                    size="small"
                    :variant="mediaFilter === option ? 'secondary' : 'ghost'"
                    :aria-pressed="mediaFilter === option"
                    @click="mediaFilter = option"
                >
                    {{ $t(`insights.mostWatched.filters.${option}`) }} ({{ formatNumber(filterCounts[option]) }})
                </Button>
            </div>
        </div>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
            <ChartCard v-for="chart in charts" :key="chart.title" :title="chart.title">
                <BarChart v-if="chart.entries.length" :entries="chart.entries" />
                <p v-else class="text-gray-500">
                    {{ chart.loading ? $t('insights.loading') : $t('insights.empty') }}
                </p>
            </ChartCard>
        </div>
    </section>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';
import { computed, ref } from 'vue';

import { formatCountry, formatLanguage, formatNumber } from '@/lib/formatting';
import { labelled } from '@/pages/insights/utils/insights';
import type { CollectionSummary, MediaType } from '@/pages/insights/utils/insights';
import TMDB from '@/services/TMDB';

const MEDIA_FILTERS: MediaType[] = ['all', 'movies', 'shows'];
const TOP_LIMIT = 10;

const { collection, creditsLoaded } = defineProps<{ collection: CollectionSummary; creditsLoaded: boolean }>();
const mediaFilter = ref<MediaType>('all');

const stats = computed(() => collection.taste[mediaFilter.value]);
const filterCounts = computed(() => ({
    all: collection.taste.all.titles,
    movies: collection.taste.movies.titles,
    shows: collection.taste.shows.titles,
}));

const charts = computed(() => [
    {
        title: translate('insights.mostWatched.genres'),
        entries: labelled(stats.value.genres.slice(0, TOP_LIMIT), (id) => TMDB.translateGenre(id) ?? String(id)),
    },
    {
        title: translate('insights.mostWatched.countries'),
        entries: labelled(stats.value.countries.slice(0, TOP_LIMIT), formatCountry),
    },
    {
        title: translate(`insights.mostWatched.makers.${mediaFilter.value}`),
        loading: !creditsLoaded,
        entries: labelled(stats.value.makers.slice(0, TOP_LIMIT), (person) => person.name),
    },
    {
        title: translate('insights.mostWatched.actors'),
        loading: !creditsLoaded,
        entries: labelled(stats.value.cast.slice(0, TOP_LIMIT), (person) => person.name),
    },
    {
        title: translate('insights.mostWatched.languages'),
        entries: labelled(stats.value.languages.slice(0, TOP_LIMIT), formatLanguage),
    },
    {
        title: translate('insights.mostWatched.decades'),
        entries: Array.from(stats.value.decades)
            .sort(([, a], [, b]) => b - a)
            .slice(0, TOP_LIMIT)
            .map(([decade, count]) => ({ label: `${decade}s`, value: count })),
    },
]);
</script>
