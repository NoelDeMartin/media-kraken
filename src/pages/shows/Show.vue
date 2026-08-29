<template>
    <Page>
        <article class="flex flex-row gap-6">
            <MediaImage :url="show.posterUrl" class="aspect-2/3 w-64 shrink-0 rounded shadow" />
            <div class="flex flex-1 flex-col">
                <div class="flex items-center justify-between gap-2">
                    <h1 class="text-2xl font-semibold text-gray-900">
                        {{ show.name }}
                        <span v-if="show.releaseYear" class="text-lg font-medium"> ({{ show.releaseYear }}) </span>
                    </h1>
                </div>
                <div
                    class="flex items-center text-sm lowercase"
                    :class="{
                        'text-green-700': show.watchingStatus === 'completed',
                        'text-blue-700': show.watchingStatus === 'pending' || show.watchingStatus === 'watching',
                        'text-gray-700': show.watchingStatus === 'dropped',
                    }"
                >
                    <i-material-symbols-check v-if="show.watchingStatus === 'completed'" class="size-4" />
                    <i-mdi-play-circle-outline v-else-if="show.watchingStatus === 'watching'" class="size-4" />
                    <i-mdi-clock-outline v-else-if="show.watchingStatus === 'pending'" class="size-4" />
                    <i-ph-archive-fill v-else class="size-4" />
                    &nbsp;
                    <span>{{ $t(`shows.statuses.${show.watchingStatus}`) }}</span>
                    &nbsp;
                    <ShowPendingEpisodesCount
                        v-if="show.watchingStatus === 'watching'"
                        :show
                        lang-key="shows.upcomingEpisodes"
                    />
                </div>
                <p v-if="show.description" class="mt-2 leading-relaxed text-gray-700">
                    {{ show.description }}
                </p>
            </div>
        </article>
        <section
            v-if="show.seasons && !$catalog.ignoresSeasons(show.watchingStatus)"
            class="mt-10"
            aria-labelledby="seasons"
        >
            <h2 id="seasons" class="text-xl font-semibold text-gray-900">{{ $t('shows.seasons') }}</h2>
            <p v-if="show.seasons.length === 0" class="mt-4 text-sm text-gray-500">{{ $t('shows.noSeasons') }}</p>
            <div v-else class="mt-6 flex flex-col gap-8">
                <ShowSeason
                    v-for="season of show.seasons"
                    :key="season.url"
                    :season
                    :open="defaultSeason?.url === season.url"
                />
            </div>
        </section>
    </Page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

import Show from '@/models/Show';

const { show } = defineProps<{ show: Show }>();
const defaultSeason = computed(() => {
    const seasonsWithoutSpecials = show.seasons?.filter((season) => season.number !== 0) ?? [];
    const firstUnwatchedSeason = seasonsWithoutSpecials.find((season) =>
        season.episodes?.some((episode) => !episode.watched),
    );

    return firstUnwatchedSeason ?? seasonsWithoutSpecials.at(-1) ?? show.seasons?.at(-1);
});

onMounted(() => show.loadAllRelationsIfUnloaded());
</script>
