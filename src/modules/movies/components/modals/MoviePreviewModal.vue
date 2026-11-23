<template>
    <Modal wrapper-class="sm:max-w-2xl" class="flex flex-row p-0">
        <MediaImage
            :url="model.posterUrl"
            class="m-1 aspect-2/3 w-56 rounded-[calc(var(--radius-lg)-(--spacing(1)))]"
        />
        <div class="flex flex-1 flex-col gap-3 p-4">
            <HeadlessModalTitle class="pr-8 text-xl font-semibold text-gray-900">
                {{ model.title }}
                <span v-if="model.releaseYear" class="text-base font-medium"> ({{ model.releaseYear }}) </span>
            </HeadlessModalTitle>
            <div v-if="model.description" class="relative flex-1">
                <p class="absolute inset-0 overflow-auto text-sm leading-relaxed text-gray-700">
                    {{ model.description }}
                </p>
            </div>
            <div v-else-if="loadingDetails" class="flex flex-1 items-center justify-center">
                <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-6 w-full" />
                <span class="sr-only">{{ $t('ui.loading') }}</span>
            </div>
            <ul :aria-label="$t('movies.externalSites')" class="ml-auto flex items-center gap-2">
                <li>
                    <ExternalSiteLink :url="tmdbMovieUrl(tmdbId)" />
                </li>
                <li v-if="details?.imdb_id">
                    <ExternalSiteLink :url="imdbUrl(details.imdb_id)" />
                </li>
            </ul>
            <div class="mt-auto flex justify-end gap-2">
                <Button class="bg-blue-600 text-white hover:bg-blue-700" @click="saveToCollection('pending')">
                    <i-mdi-clock-outline class="size-4" />
                    {{ $t('movies.watchLater') }}
                </Button>
                <Button class="bg-green-600 text-white hover:bg-green-700" @click="saveToCollection('watched')">
                    <i-material-symbols-check class="size-4" />
                    {{ $t('movies.watched') }}
                </Button>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { Errors, translate, UI, useModal } from '@aerogel/core';
import { isInstanceOf, required } from '@noeldemartin/utils';
import { computed, onMounted, ref, shallowRef } from 'vue';

import { imdbUrl } from '@/lib/imdb';
import { tmdbMovieUrl } from '@/lib/tmdb';
import Catalog from '@/services/Catalog';
import type { TMDBMovie, TMDBMovieWithStaff } from '@/services/TMDB';
import TMDB from '@/services/TMDB';
import Movie from '@movies/models/Movie';
import type { MovieWatchingStatus } from '@movies/models/WatchAction';

const { movie } = defineProps<{ movie: TMDBMovie | Movie }>();
const { close } = useModal();
const tmdbId = isInstanceOf(movie, Movie) ? required(movie.tmdbId) : movie.id;
const details = shallowRef<TMDBMovieWithStaff | null>(null);
const detailsFailed = ref(false);
const loadingDetails = computed(() => !details.value && !detailsFailed.value && isInstanceOf(movie, Movie));
const model = computed(() => {
    const tmdbMovie = details.value ?? (isInstanceOf(movie, Movie) ? null : movie);

    return tmdbMovie ? Movie.fromTMDB(tmdbMovie, { posterSize: 'large' }) : (movie as Movie);
});

async function saveToCollection(watchingStatus: MovieWatchingStatus) {
    close();

    await Catalog.importMovieFromTMDB(tmdbId, { watchingStatus });

    UI.toast(translate('movies.added', { movie: model.value.title }));
}

onMounted(async () => {
    try {
        details.value = await TMDB.getMovie(tmdbId, { includeCredits: false, includeKeywords: false });
    } catch (error) {
        detailsFailed.value = true;

        await Errors.report(error);
    }
});
</script>
