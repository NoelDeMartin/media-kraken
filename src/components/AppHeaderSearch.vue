<template>
    <Button ref="$triggerRef" @click="searching = true" variant="ghost" class="text-primary-text/50 gap-2 font-normal">
        <i-ph-magnifying-glass class="size-5" />
        <span>{{ $t('app.nav.search') }}</span>
    </Button>
    <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <div v-if="searching" class="bg-background absolute top-8 right-0 bottom-0 left-16 z-10 flex items-center pl-2">
            <HeadlessCombobox
                v-model:open="open"
                role="search"
                ref="$comboboxRef"
                wrapper-class="w-full"
                ignore-filter
                @update:model-value="(value) => openResult(value as Nullable<Movie>)"
            >
                <label class="sr-only" for="global-search">{{ $t('app.search.label') }}</label>
                <div class="relative rounded-md shadow-2xs">
                    <HeadlessComboboxInput
                        id="global-search"
                        type="search"
                        v-model="query"
                        :placeholder="$t('app.search.placeholder')"
                        :display-value="() => ''"
                        @keydown.escape="closeSearch({ refocusButton: true })"
                        @blur="closeSearch({ refocusButton: false })"
                        class="focus:ring-primary-600 block w-full rounded-md border-0 py-1.5 pr-2.5 pl-9 text-gray-900 ring-1 ring-gray-900/10 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset"
                    />
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                        <i-ph-magnifying-glass class="size-5 text-gray-400" />
                    </div>
                </div>

                <HeadlessComboboxContent
                    id="search-results"
                    class="mt-1 max-h-[calc(100dvh-(--spacing(26)))] w-full overflow-auto rounded-md bg-white p-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden sm:text-sm"
                >
                    <div
                        v-if="loading"
                        class="relative cursor-default px-4 py-3 text-center text-sm text-gray-500 select-none"
                    >
                        <i-svg-spinners-3-dots-scale-middle class="text-primary h-8 w-full" />
                        <span class="sr-only">{{ $t('app.search.loading') }}</span>
                    </div>
                    <HeadlessComboboxEmpty
                        v-else-if="results.length === 0"
                        class="relative cursor-default px-4 py-3 text-center text-sm text-gray-500 select-none"
                    >
                        {{ $t('app.search.noResults') }}
                    </HeadlessComboboxEmpty>
                    <HeadlessComboboxGroup v-else>
                        <HeadlessComboboxOption v-for="movie in results" :key="movie.url" :value="movie" as-child>
                            <li
                                :id="`result-${movie.url}`"
                                class="relative flex cursor-pointer items-center gap-3 rounded-md px-2 py-1 text-gray-900 transition-colors duration-150 select-none data-highlighted:bg-gray-100 data-highlighted:font-medium data-highlighted:text-gray-900"
                            >
                                <MoviePoster :poster-url="movie.posterUrl" class="size-12 rounded" />
                                <div class="min-w-0 flex-auto">
                                    <p class="truncate text-sm font-medium">{{ movie.title }}</p>
                                    <p class="text-xs text-gray-500">{{ movie.releaseYear ?? '—' }}</p>
                                </div>
                            </li>
                        </HeadlessComboboxOption>
                    </HeadlessComboboxGroup>
                </HeadlessComboboxContent>
            </HeadlessCombobox>
        </div>
    </Transition>
    <div class="sr-only" aria-live="polite" aria-atomic="true">
        <template v-if="trimmedQuery.length > 0">
            <span v-if="loading">
                {{ $t('app.search.loading') }}
            </span>
            <span v-else-if="results.length > 0">
                {{ $t('app.search.resultsCount', { count: results.length }) }}
            </span>
            <span v-else>
                {{ $t('app.search.noResults') }}
            </span>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Errors, UI } from '@aerogel/core';
import { debounce, fail, type Nullable } from '@noeldemartin/utils';
import { ref, watch, useTemplateRef, shallowRef, nextTick, computed, toRaw } from 'vue';

import MoviePreviewModal from '@/components/modals/MoviePreviewModal.vue';
import Movie from '@/models/Movie';
import TMDB, { type TMDBMovie } from '@/services/TMDB';

let refocusButton = false;
const $triggerRef = useTemplateRef('$triggerRef');
const $comboboxRef = useTemplateRef('$comboboxRef');
const query = ref('');
const trimmedQuery = computed(() => query.value.trim());
const searching = ref(false);
const loading = ref(false);
const open = ref(false);
const results = shallowRef<Movie[]>([]);
const tmdbResults = new WeakMap<Movie, TMDBMovie>();
const updateSearch = debounce(async () => {
    try {
        const queriedResults = await TMDB.searchMovies(trimmedQuery.value);

        results.value = queriedResults.map((tmdb) => {
            const model = Movie.fromTMDB(tmdb, { posterSize: 'small', mintUrl: true });

            tmdbResults.set(model, tmdb);

            return model;
        });
    } catch (error) {
        results.value = [];

        Errors.report(error);
    } finally {
        loading.value = false;
    }
}, 350);

async function openResult(value: Nullable<Movie>) {
    if (!value) {
        return;
    }

    query.value = '';

    closeSearch({ refocusButton: true });

    await UI.modal(MoviePreviewModal, { movie: tmdbResults.get(toRaw(value)) ?? fail<TMDBMovie>('Movie not found') });
}

function closeSearch(options: { refocusButton: boolean }) {
    if (!searching.value) {
        return;
    }

    refocusButton = options.refocusButton;

    open.value = false;
    searching.value = false;
}

watch(searching, async () => {
    await nextTick();

    if (searching.value) {
        $comboboxRef.value?.focus();
    } else if (refocusButton) {
        $triggerRef.value?.focus();
    }
});

watch(trimmedQuery, () => {
    if (trimmedQuery.value.length === 0) {
        results.value = [];
        loading.value = false;
        open.value = false;

        return;
    }

    loading.value = true;

    updateSearch();
});
</script>
