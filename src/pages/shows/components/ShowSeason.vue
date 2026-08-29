<template>
    <details class="group" :open>
        <summary
            class="grid cursor-pointer list-none grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-2 py-1 [&::-webkit-details-marker]:hidden"
        >
            <i-mdi-chevron-right
                class="size-5 justify-self-center text-gray-400 transition-transform group-open:rotate-90"
                aria-hidden="true"
            />
            <h3 class="text-lg font-medium text-gray-900">
                {{ $t('shows.seasonNumber', { number: season.number }) }}
            </h3>
            <span class="text-sm text-gray-500">
                {{
                    $t('shows.episodesWatched', {
                        watched: watchedCount,
                        total: episodes.length,
                    })
                }}
            </span>
        </summary>
        <ol class="mt-1 flex flex-col">
            <li
                v-for="episode of episodes"
                :key="episode.url"
                class="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-2 py-2"
            >
                <span class="justify-self-center text-sm font-medium text-gray-500 tabular-nums">
                    {{ String(episode.number).padStart(2, '0') }}
                </span>
                <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span class="truncate text-sm font-medium text-gray-900">
                        {{ episode.name }}
                    </span>
                    <span v-if="episode.publishedAt" class="text-xs text-gray-500">
                        {{ formatDate(episode.publishedAt) }}
                    </span>
                </div>
                <div class="flex shrink-0 items-center">
                    <span
                        v-if="episode.watched"
                        class="flex items-center gap-1 px-2.5 text-sm text-green-700"
                        :title="$t('shows.episodeWatched')"
                    >
                        <i-material-symbols-check class="size-5" />
                        <span class="sr-only">{{ $t('shows.episodeWatched') }}</span>
                    </span>
                    <Button
                        v-else
                        variant="ghost"
                        :disabled="loadingEpisode === episode.url"
                        :title="$t('shows.watchEpisode')"
                        @click="watchEpisode(episode)"
                    >
                        <i-mdi-clock-outline class="size-5 text-blue-500" />
                        <span class="sr-only">{{ $t('shows.watchEpisode') }}</span>
                    </Button>
                </div>
            </li>
        </ol>
    </details>
</template>

<script setup lang="ts">
import { computedModel, computedModels } from '@aerogel/plugin-solid';
import { computed, ref } from 'vue';

import { formatDate } from '@/lib/formatting';
import Episode from '@/models/Episode';
import Season from '@/models/Season';

const { season: seasonProp } = defineProps<{ season: Season; open?: boolean }>();
const season = computedModel(() => seasonProp);
const episodes = computedModels(Episode, () => season.value.episodes ?? []);
const watchedCount = computed(() => episodes.value.filter((episode) => episode.watched).length);
const loadingEpisode = ref<string | null>(null);

async function watchEpisode(episode: Episode) {
    loadingEpisode.value = episode.url ?? null;

    try {
        await episode.watch();
    } finally {
        loadingEpisode.value = null;
    }
}
</script>
