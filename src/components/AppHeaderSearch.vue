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
            <MediaSearch
                ref="$mediaSearchRef"
                :loading
                :results
                v-model:open="open"
                v-model:query="query"
                @select="selectResult($event)"
                @exit="closeSearch({ refocusButton: true })"
                @blur="closeSearch({ refocusButton: false })"
            />
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
import { debounce, fail } from '@noeldemartin/utils';
import { ref, watch, useTemplateRef, shallowRef, nextTick, computed, toRaw } from 'vue';

import MoviePreviewModal from '@/components/modals/MoviePreviewModal.vue';
import ShowPreviewModal from '@/components/modals/ShowPreviewModal.vue';
import Movie from '@/models/Movie';
import Show from '@/models/Show';
import TMDB, { type TMDBSearchResult } from '@/services/TMDB';

type SearchResult = Movie | Show;

let refocusButton = false;
const $triggerRef = useTemplateRef('$triggerRef');
const $mediaSearchRef = useTemplateRef('$mediaSearchRef');
const query = ref('');
const trimmedQuery = computed(() => query.value.trim());
const searching = ref(false);
const loading = ref(false);
const open = ref(false);
const results = shallowRef<SearchResult[]>([]);
const tmdbResults = new WeakMap<SearchResult, TMDBSearchResult>();
const updateSearch = debounce(async () => {
    try {
        const queriedResults = await TMDB.search(trimmedQuery.value);

        results.value = queriedResults.map((tmdb) => {
            const model =
                tmdb.media_type === 'movie'
                    ? Movie.fromTMDB(tmdb, { posterSize: 'small', mintUrl: true })
                    : Show.fromTMDB(tmdb, { posterSize: 'small', mintUrl: true });

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

async function selectResult(value: SearchResult) {
    query.value = '';

    closeSearch({ refocusButton: true });

    const tmdb = tmdbResults.get(toRaw(value)) ?? fail<TMDBSearchResult>('Result not found');

    switch (tmdb.media_type) {
        case 'movie':
            await UI.modal(MoviePreviewModal, { movie: tmdb });
            break;
        case 'tv':
            await UI.modal(ShowPreviewModal, { show: tmdb });
            break;
    }
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
        $mediaSearchRef.value?.focus();
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
