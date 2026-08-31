<template>
    <Page>
        <article class="flex flex-row gap-6">
            <MediaImage :url="movie.posterUrl" class="aspect-2/3 w-64 shrink-0 rounded shadow" />
            <div class="flex flex-1 flex-col">
                <div class="flex items-center justify-between gap-2">
                    <h1 class="text-2xl font-semibold text-gray-900">
                        {{ movie.title }}
                        <span v-if="movie.releaseYear" class="text-lg font-medium"> ({{ movie.releaseYear }}) </span>
                    </h1>
                    <IconSync v-if="syncing" class="m-2.5 size-5 animate-spin" />
                    <DropdownMenu
                        v-else
                        align="end"
                        :options="[
                            movie.watched
                                ? {
                                      label: $t('movies.watchLater'),
                                      icon: IconClock,
                                      click: () => movie.unwatch(),
                                  }
                                : {
                                      label: $t('movies.watch'),
                                      icon: IconCheck,
                                      click: () => movie.watch(),
                                  },
                            {
                                label: $t('movies.synchronize'),
                                icon: IconSync,
                                click: () => runSyncing($catalog.sync(movie)),
                            },
                        ]"
                    >
                        <Button
                            size="icon"
                            variant="ghost"
                            :aria-label="$t('movies.openActionsMenu')"
                            :title="$t('movies.openActionsMenu')"
                        >
                            <i-mdi-dots-vertical class="size-5" />
                        </Button>
                    </DropdownMenu>
                </div>
                <div
                    class="flex items-center gap-1 text-sm lowercase"
                    :class="{
                        'text-green-700': movie.watched,
                        'text-blue-700': !movie.watched,
                    }"
                >
                    <i-material-symbols-check v-if="movie.watched" class="size-4" />
                    <i-mdi-clock-outline v-else class="size-4" />
                    <span>{{ movie.watched ? $t('movies.watched') : $t('movies.watchLater') }}</span>
                </div>
                <p v-if="movie.description" class="mt-2 leading-relaxed text-gray-700">
                    {{ movie.description }}
                </p>

                <div class="flex-1" />

                <ul :aria-label="$t('movies.externalSites')" class="flex items-center justify-end gap-2">
                    <li v-for="(url, index) in movie.externalUrls" :key="index">
                        <ExternalSiteLink :url />
                    </li>
                </ul>
            </div>
        </article>
    </Page>
</template>

<script setup lang="ts">
import { useLoading } from '@aerogel/core';
import IconCheck from '~icons/material-symbols/check';
import IconClock from '~icons/mdi/clock-outline';
import IconSync from '~icons/mdi/sync';

import Movie from '@/models/Movie';

const { movie } = defineProps<{ movie: Movie }>();
const { loading: syncing, run: runSyncing } = useLoading();
</script>
