<template>
    <Modal :title="modalTitle" class="sm:max-w-xl">
        <div class="flex flex-col gap-4 sm:flex-row">
            <div v-if="model.posterUrl" class="w-28 shrink-0 self-center sm:self-start">
                <MoviePoster :poster-url="model.posterUrl" class="aspect-2/3 rounded shadow" />
            </div>
            <div class="flex flex-1 flex-col gap-3">
                <p v-if="model.description" class="text-sm leading-relaxed text-gray-700">
                    {{ model.description }}
                </p>
                <div v-if="externalUrls.length > 0" class="flex items-center justify-end gap-2">
                    <a
                        v-for="url in externalUrls"
                        :key="url"
                        :href="url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-primary-700 text-xs hover:underline"
                    >
                        view at {{ getDomain(url) }}
                    </a>
                </div>
                <div class="mt-auto flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
                    <span class="text-sm font-medium text-gray-700">Add it to your collection:</span>
                    <div class="flex gap-2">
                        <Button class="bg-blue-600 text-white hover:bg-blue-700" @click="saveWatchLater">
                            <i-mdi-clock-outline class="size-4" />
                            {{ $t('movies.watchLater') }}
                        </Button>
                        <Button class="bg-green-600 text-white hover:bg-green-700" @click="saveWatched">
                            <i-material-symbols-check class="size-4" />
                            {{ $t('movies.watched') }}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { translate, UI, useModal } from '@aerogel/core';
import { computed } from 'vue';

import Movie from '@/models/Movie';
import type { TMDBMovie } from '@/services/TMDB';

const { movie } = defineProps<{ movie: TMDBMovie }>();
const { close } = useModal();
const model = computed(() => Movie.fromTMDB(movie, { posterSize: 'large', mintUrl: true }));

const modalTitle = computed(() => {
    return model.value.releaseYear ? `${model.value.title} (${model.value.releaseYear})` : model.value.title;
});

const externalUrls = computed(() => model.value.externalUrls ?? []);

function getDomain(urlStr: string): string {
    try {
        const hostname = new URL(urlStr).hostname;

        return hostname.replace(/^www\./, '');
    } catch {
        return urlStr;
    }
}

async function saveWatchLater() {
    close();

    await model.value.save();

    UI.toast(translate('movies.added', { movie: model.value.title }));
}

async function saveWatched() {
    close();

    await model.value.watch();
    await model.value.save();

    UI.toast(translate('movies.added', { movie: model.value.title }));
}
</script>
