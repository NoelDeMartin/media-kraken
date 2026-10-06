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
            <ul :aria-label="$t('movies.externalSites')" class="ml-auto flex items-center gap-2">
                <li>
                    <ExternalSiteLink :url="tmdbMovieUrl(movie.id)" />
                </li>
                <li v-if="details?.imdb_id">
                    <ExternalSiteLink :url="imdbUrl(details.imdb_id)" />
                </li>
            </ul>
            <div class="mt-auto flex justify-end gap-2">
                <Button class="bg-blue-600 text-white hover:bg-blue-700" @click="saveToCollection({ watched: false })">
                    <i-mdi-clock-outline class="size-4" />
                    {{ $t('movies.watchLater') }}
                </Button>
                <Button class="bg-green-600 text-white hover:bg-green-700" @click="saveToCollection({ watched: true })">
                    <i-material-symbols-check class="size-4" />
                    {{ $t('movies.watched') }}
                </Button>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { translate, UI, useModal } from '@aerogel/core';
import { computed, onMounted, shallowRef } from 'vue';

import { imdbUrl } from '@/lib/imdb';
import { tmdbMovieUrl } from '@/lib/tmdb';
import Movie from '@/models/Movie';
import Catalog from '@/services/Catalog';
import type { TMDBMovie, TMDBMovieWithStaff } from '@/services/TMDB';
import TMDB from '@/services/TMDB';

const { movie } = defineProps<{ movie: TMDBMovie }>();
const { close } = useModal();
const model = computed(() => Movie.fromTMDB(movie, { posterSize: 'large' }));
const details = shallowRef<TMDBMovieWithStaff | null>(null);

async function saveToCollection(options: { watched: boolean }) {
    close();

    await Catalog.importMovieFromTMDB(movie, { watched: options.watched });

    UI.toast(translate('movies.added', { movie: model.value.title }));
}

onMounted(async () => {
    details.value = await TMDB.getMovie(movie.id, { includeStaff: false });
});
</script>
