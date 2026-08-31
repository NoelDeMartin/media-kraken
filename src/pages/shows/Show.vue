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
                    <IconSync v-if="syncing" class="m-2.5 size-5 animate-spin" />
                    <DropdownMenu
                        v-else
                        align="end"
                        :options="[
                            ...watchingStatusOptions,
                            {
                                label: $t('shows.synchronize'),
                                icon: IconSync,
                                click: sync,
                            },
                        ]"
                    >
                        <Button
                            size="icon"
                            variant="ghost"
                            :aria-label="$t('shows.openActionsMenu')"
                            :title="$t('shows.openActionsMenu')"
                        >
                            <i-mdi-dots-vertical class="size-5" />
                        </Button>
                    </DropdownMenu>
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

                <div class="flex-1" />

                <ul :aria-label="$t('shows.externalSites')" class="flex items-center justify-end gap-2">
                    <li v-for="(url, index) in show.externalUrls" :key="index">
                        <ExternalSiteLink :url />
                    </li>
                </ul>
            </div>
        </article>
        <section
            v-if="seasons && !$catalog.ignoresSeasons(show.watchingStatus)"
            class="mt-10"
            aria-labelledby="seasons"
        >
            <h2 id="seasons" class="text-xl font-semibold text-gray-900">{{ $t('shows.seasons') }}</h2>
            <p v-if="seasons.length === 0" class="mt-4 text-sm text-gray-500">{{ $t('shows.noSeasons') }}</p>
            <div v-else class="mt-6 flex flex-col gap-8">
                <ShowSeason
                    v-for="season of seasons"
                    :key="season.url"
                    :season
                    :open="defaultSeason?.url === season.url"
                />
            </div>
        </section>
    </Page>
</template>

<script setup lang="ts">
import { translate, useLoading } from '@aerogel/core';
import { arraySorted } from '@noeldemartin/utils';
import { computed, onMounted } from 'vue';
import IconCheck from '~icons/material-symbols/check';
import IconClock from '~icons/mdi/clock-outline';
import IconPlay from '~icons/mdi/play-circle-outline';
import IconSync from '~icons/mdi/sync';
import IconArchive from '~icons/ph/archive-fill';

import Show from '@/models/Show';
import Catalog from '@/services/Catalog';

const { show } = defineProps<{ show: Show }>();
const { loading: syncing, run: runSyncing } = useLoading();
const seasons = computed(() => show.seasons && arraySorted(show.seasons, 'number'));
const watchingStatusOptions = computed(() => {
    const statuses = [
        {
            value: 'watching' as const,
            label: translate('shows.markAsWatching'),
            icon: IconPlay,
        },
        {
            value: 'completed' as const,
            label: translate('shows.markAsCompleted'),
            icon: IconCheck,
        },
        {
            value: 'dropped' as const,
            label: translate('shows.markAsDropped'),
            icon: IconArchive,
        },
        {
            value: 'pending' as const,
            label: translate('shows.markAsPending'),
            icon: IconClock,
        },
    ];

    return statuses
        .filter((status) => status.value !== show.watchingStatus)
        .map((status) => ({
            label: status.label,
            icon: status.icon,
            async click() {
                await show.updateWatchingStatus(status.value);

                if (await Catalog.needsSync(show)) {
                    await sync();
                }
            },
        }));
});

const defaultSeason = computed(() => {
    const seasonsWithoutSpecials = seasons.value?.filter((season) => season.number !== 0) ?? [];
    const firstUnwatchedSeason = seasonsWithoutSpecials.find((season) =>
        season.episodes?.some((episode) => !episode.watched),
    );

    return firstUnwatchedSeason ?? seasonsWithoutSpecials.at(-1) ?? seasons.value?.at(-1);
});

async function sync() {
    await runSyncing(Catalog.sync(show));
}

onMounted(() => show.loadAllRelationsIfUnloaded());
</script>
