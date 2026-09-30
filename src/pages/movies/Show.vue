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
                                label: $t('media.synchronize'),
                                icon: IconSync,
                                click: () => runSync($catalog.sync(movie)),
                            },
                        ]"
                    >
                        <Button size="icon" variant="ghost" :title="$t('movies.openActionsMenu')" class="-mr-4">
                            <i-mdi-dots-vertical class="size-5" />
                            <span class="sr-only">{{ $t('movies.openActionsMenu') }}</span>
                        </Button>
                    </DropdownMenu>
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-gray-600">
                    <span
                        class="flex items-center gap-1 lowercase"
                        :class="{
                            'text-green-700': movie.watched,
                            'text-blue-700': !movie.watched,
                        }"
                    >
                        <i-material-symbols-check v-if="movie.watched" class="size-4" />
                        <i-mdi-clock-outline v-else class="size-4" />
                        {{ movie.watched ? $t('movies.watched') : $t('movies.watchLater') }}
                    </span>
                    <template v-if="movie.runtimeMinutes">
                        <span aria-hidden="true">·</span>
                        <span>{{ formatDuration({ minutes: movie.runtimeMinutes }) }}</span>
                    </template>
                </div>
                <p v-if="movie.description" class="mt-4 leading-relaxed text-gray-700">
                    {{ movie.description }}
                </p>
                <div class="min-h-6 flex-1" />

                <div class="flex items-end gap-6">
                    <dl
                        v-if="movie.directors?.length || details.length > 0"
                        class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm"
                        :aria-label="$t('movies.details.title')"
                    >
                        <template v-if="movie.directors?.length">
                            <dt class="font-medium text-gray-900">
                                {{ $t('movies.details.directedBy') }}
                            </dt>
                            <dd class="text-gray-700">
                                <template v-for="(director, index) in movie.directors" :key="director.url">
                                    <MaybeLink
                                        :href="director.tmdbUrl"
                                        target="_blank"
                                        rel="noopener"
                                        class="focus-visible:ring-focus rounded focus-visible:ring-2 focus-visible:outline-none"
                                        :class="director.tmdbUrl ? 'hover:underline' : ''"
                                    >
                                        {{ director.name }}
                                    </MaybeLink>
                                    <template v-if="index < movie.directors.length - 1">, </template>
                                </template>
                            </dd>
                        </template>
                        <template v-for="detail in details" :key="detail.label">
                            <dt class="font-medium text-gray-900">{{ detail.label }}</dt>
                            <dd class="text-gray-700">{{ detail.value }}</dd>
                        </template>
                    </dl>
                    <ul :aria-label="$t('movies.externalSites')" class="ml-auto flex items-center gap-2">
                        <li v-for="(url, index) in movie.externalUrls" :key="index">
                            <ExternalSiteLink :url />
                        </li>
                    </ul>
                </div>
            </div>
        </article>
        <section v-if="cast.length" class="mt-10" aria-labelledby="cast">
            <h2 id="cast" class="text-xl font-semibold text-gray-900">{{ $t('movies.details.topCast') }}</h2>
            <ul class="mt-4 grid grid-cols-6 gap-4 sm:grid-cols-3 md:grid-cols-6">
                <li v-for="role in cast" :key="role.url">
                    <PersonCard :person="role.actor" :characters="role.characterNames" />
                </li>
            </ul>
        </section>
    </Page>
</template>

<script setup lang="ts">
import { translate, useLoading } from '@aerogel/core';
import { isTruthy } from '@noeldemartin/utils';
import { computed, onMounted } from 'vue';
import IconCheck from '~icons/material-symbols/check';
import IconClock from '~icons/mdi/clock-outline';
import IconSync from '~icons/mdi/sync';

import { formatCountry, formatDuration, formatLanguage } from '@/lib/formatting';
import Movie from '@/models/Movie';
import type PerformanceRole from '@/models/PerformanceRole';
import type Person from '@/models/Person';
import TMDB from '@/services/TMDB';

const { movie } = defineProps<{ movie: Movie }>();
const { loading: syncing, run: runSync } = useLoading();
const cast = computed(() =>
    (movie.cast ?? []).filter((role): role is PerformanceRole & { actor: Person } => !!role.actor),
);
const details = computed(() => {
    return [
        {
            label: translate('movies.details.genres'),
            value: movie.genreIds
                .map((id) => TMDB.translateGenre(id))
                .filter(isTruthy)
                .join(', '),
        },
        {
            label: translate('movies.details.countries'),
            value: movie.countryCodes.map((code) => formatCountry(code)).join(', '),
        },
        {
            label: translate('movies.details.languages'),
            value: movie.languages.map((language) => formatLanguage(language)).join(', '),
        },
    ].filter((detail) => detail.value);
});

onMounted(() => movie.loadAllRelationsIfUnloaded());
</script>
