<template>
    <Modal :title="$t('lists.addItems.title')" wrapper-class="sm:max-w-xl">
        <div class="relative">
            <input
                ref="$inputRef"
                v-model="query"
                type="search"
                :placeholder="$t('lists.addItems.searchPlaceholder')"
                :aria-label="$t('lists.addItems.searchPlaceholder')"
                class="focus:ring-focus block w-full rounded-md border-0 py-1.5 pr-2.5 pl-9 text-gray-900 ring-1 ring-gray-900/10 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset"
            />
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                <i-ph-magnifying-glass class="size-5 text-gray-400" />
            </div>
        </div>
        <div v-if="loading" class="py-12 text-center">
            <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
        </div>
        <p v-else-if="results.length === 0" class="py-12 text-center text-sm text-gray-500">
            {{ $t('lists.addItems.noResults') }}
        </p>
        <ul v-else class="mt-4 divide-y divide-gray-100">
            <li v-for="result of results" :key="result.url" class="flex items-center gap-3 py-2">
                <MediaImage :url="result.posterUrl" class="aspect-2/3 w-8 shrink-0 rounded" />
                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-gray-900">{{ mediaName(result) }}</p>
                    <p class="flex items-center gap-1 text-xs text-gray-500">
                        <template v-if="isInstanceOf(result, Movie)">
                            <i-ph-film-slate class="size-4" />
                            <span class="sr-only">{{ $t('lists.movie') }} — </span>
                        </template>
                        <template v-else>
                            <i-ph-television-simple class="size-4" />
                            <span class="sr-only">{{ $t('lists.show') }} — </span>
                        </template>
                        {{ result.releaseYear ?? '—' }}
                    </p>
                </div>
                <span v-if="list.has(result)" class="flex items-center gap-1 text-xs text-gray-500">
                    <i-mdi-check class="size-4" />
                    {{ $t('lists.addItems.alreadyAdded') }}
                </span>
                <Button
                    v-else
                    size="small"
                    :aria-label="$t('lists.addItems.addA11y', { name: mediaName(result) })"
                    :disabled="!!adding"
                    :loading="adding === result"
                    @click="add(result)"
                >
                    {{ $t('lists.addItems.add') }}
                </Button>
            </li>
        </ul>
        <p v-if="!loading && hiddenResultsCount > 0" class="mt-2 text-center text-xs text-gray-500">
            {{ $t('lists.addItems.moreResults', { count: hiddenResultsCount }) }}
        </p>
    </Modal>
</template>

<script setup lang="ts">
import { computedModel, useModels } from '@aerogel/plugin-solid';
import { isInstanceOf } from '@noeldemartin/utils';
import { computed, onMounted, ref, useTemplateRef } from 'vue';

import { mediaName, sortByLocale, toSearchText } from '@/lib/media';
import type List from '@/models/List';
import Movie from '@/models/Movie';
import Show from '@/models/Show';

const MAX_RESULTS = 10;

const { list: listProp } = defineProps<{ list: List }>();
const list = computedModel(() => listProp);
const query = ref('');
const adding = ref<Movie | Show | null>(null);
const $input = useTemplateRef('$inputRef');
const { models: movies, loading: loadingMovies } = useModels(Movie);
const { models: shows, loading: loadingShows } = useModels(Show);
const loading = computed(() => loadingMovies.value || loadingShows.value);
const searchIndex = computed(() =>
    sortByLocale([...movies.value, ...shows.value], mediaName).map((media) => ({
        media,
        searchText: toSearchText(mediaName(media)),
    })),
);
const matches = computed(() => {
    const searchQuery = toSearchText(query.value);

    return searchIndex.value.filter((entry) => entry.searchText.includes(searchQuery)).map((entry) => entry.media);
});
const results = computed(() => matches.value.slice(0, MAX_RESULTS));
const hiddenResultsCount = computed(() => matches.value.length - results.value.length);

async function add(media: Movie | Show) {
    adding.value = media;

    try {
        await list.value.add(media);
    } finally {
        adding.value = null;
    }
}

onMounted(() => $input.value?.focus());
</script>
