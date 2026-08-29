<template>
    <article class="rounded-card relative isolate aspect-4/3 overflow-hidden shadow-sm">
        <MediaImage :url="show.backdropUrl || show.posterUrl" class="size-full" />
        <RouterLink
            :to="{
                name: 'shows.show',
                params: { show: show.slug },
                query: $solid.hasLoggedIn() ? { url: show.url } : undefined,
            }"
            tabindex="-1"
            aria-hidden="true"
            class="group"
        >
            <div
                class="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span class="absolute inset-0"></span>
        </RouterLink>
        <span
            v-if="hasUpcomingEpisodes"
            class="pointer-events-none absolute top-3 right-3 flex items-center justify-center bg-blue-200 text-xs font-semibold text-blue-600 shadow-sm"
            :class="{
                'rounded-full px-2.5 py-1': !hasPendingEpisodes,
                'size-7 rounded-full': hasPendingEpisodes,
            }"
        >
            {{ hasPendingEpisodes ? releasedEpisodes?.length : $t('shows.upcomingEpisodeIn', { days: nextEpisodeIn }) }}
        </span>
        <div
            class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 border-t border-white/40 bg-white/70 px-4 py-3 backdrop-blur-lg"
        >
            <div class="flex min-w-0 flex-col gap-0.5">
                <h2>
                    <RouterLink
                        :to="{
                            name: 'shows.show',
                            params: { show: show.slug },
                            query: $solid.hasLoggedIn() ? { url: show.url } : undefined,
                        }"
                        class="focus:ring-primary-500 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 focus-visible:outline-none"
                    >
                        <span class="truncate text-sm leading-tight font-semibold tracking-tight text-gray-900">
                            {{ show.name }}
                        </span>
                    </RouterLink>
                </h2>
                <p class="text-xs leading-snug font-normal text-gray-700">
                    {{
                        hasUpcomingEpisodes && nextEpisode
                            ? $t('shows.nextEpisode', {
                                  season: nextEpisode.seasonNumber,
                                  number: nextEpisode.episodeNumber,
                                  name: nextEpisode.name,
                              })
                            : $t('shows.noUpcomingEpisodes')
                    }}
                </p>
            </div>
            <Button v-if="hasPendingEpisodes" variant="ghost" size="icon" class="-mr-1 shrink-0">
                <i-material-symbols-check class="size-6 text-gray-900" />
                <span class="sr-only">{{ $t('shows.watchEpisode') }}</span>
            </Button>
            <i-mdi-clock-outline v-else-if="hasUpcomingEpisodes" class="size-5 shrink-0 text-gray-600" />
        </div>
    </article>
</template>

<script setup lang="ts">
import { DAY_MILLISECONDS } from '@noeldemartin/utils';
import { computed } from 'vue';

import { useUpcomingEpisodes } from '@/lib/composition/shows';
import { NOW } from '@/lib/time';
import Episode from '@/models/Episode';
import type Show from '@/models/Show';

const { show } = defineProps<{ show: Show }>();
const upcomingEpisodes = useUpcomingEpisodes(show, { sorted: true });
const releasedEpisodes = computed(() =>
    upcomingEpisodes.value?.filter((episode) => episode.publishedAt && Episode.isReleased(episode.publishedAt)),
);
const hasUpcomingEpisodes = computed(() => upcomingEpisodes.value && upcomingEpisodes.value.length > 0);
const hasPendingEpisodes = computed(() => releasedEpisodes.value && releasedEpisodes.value.length > 0);
const nextEpisodeIn = computed(
    () =>
        upcomingEpisodes.value?.[0]?.publishedAt &&
        Math.ceil((upcomingEpisodes.value[0].publishedAt.getTime() - NOW) / DAY_MILLISECONDS),
);
const nextEpisode = computed(() => upcomingEpisodes.value?.[0]);
</script>
