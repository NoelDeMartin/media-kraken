<template>
    <Page :fullbleed="display === 'table'">
        <div
            class="max-w-screen-content mx-auto flex w-full items-center justify-start"
            :class="{ 'px-edge': display === 'table' }"
        >
            <IconSync v-if="syncing" class="m-2.5 size-5 animate-spin" />
            <DropdownMenu
                v-else
                align="start"
                :options="[
                    {
                        icon: IconUpload,
                        label: $t('movies.import'),
                        click: () => $ui.modal(ImportMediaModal),
                    },
                    {
                        icon: IconSync,
                        label: $t('movies.synchronizeAll'),
                        click: () => runSync($catalog.syncIfNeeded(allMovies)),
                    },
                ]"
            >
                <Button size="icon" variant="ghost" :title="$t('movies.openActionsMenu')" class="-ml-3 rounded-md p-1">
                    <i-mdi-dots-vertical class="size-5" />
                    <span class="sr-only">{{ $t('movies.openActionsMenu') }}</span>
                </Button>
            </DropdownMenu>
            <PageTitle>{{ $t('movies.title') }} ({{ filteredMovies.length }})</PageTitle>
            <div class="flex-1" />
            <div v-if="!hasEmptyCollection" class="-mr-3 flex items-center gap-1">
                <Button
                    @click="display = display === 'table' ? 'grid' : 'table'"
                    variant="ghost"
                    class="px-1.5"
                    :title="display === 'grid' ? $t('movies.viewList') : $t('movies.viewGrid')"
                >
                    <template v-if="display === 'grid'">
                        <i-mdi-view-grid class="size-6" />
                        <span class="sr-only">{{ $t('movies.viewList') }}</span>
                    </template>
                    <template v-else>
                        <i-mdi-view-list class="size-6" />
                        <span class="sr-only">{{ $t('movies.viewGrid') }}</span>
                    </template>
                </Button>
                <Button
                    variant="ghost"
                    :title="$t('movies.advancedFilters.button')"
                    :class="{ 'text-primary-500': hasAdvancedFilters }"
                    class="relative px-1.5"
                    @click="updateAdvancedFilters()"
                >
                    <i-mdi-filter class="size-6" />
                    <span
                        v-if="hasAdvancedFilters"
                        class="bg-primary-500 pointer-events-none absolute top-1.5 right-1.5 size-2 rounded-full ring-2 ring-white"
                    />
                    <span class="sr-only">{{ $t('movies.advancedFilters.button') }}</span>
                </Button>
                <FluidSearch
                    v-model="quickFilter"
                    :placeholder="$t('movies.quickFilter')"
                    :label="$t('movies.quickFilterTitle')"
                    :searching-label="$t('movies.quickFilterLabel')"
                    searching-class="pr-3"
                />
            </div>
        </div>
        <VirtualMediaGrid
            v-if="display === 'grid'"
            by="url"
            :chunk-attrs="{
                as: TransitionGroup,
                tag: 'div',
                class: 'relative mt-2',
                enterActiveClass: 'transition-all ease-out duration-300',
                enterFromClass: 'opacity-0',
                leaveActiveClass: 'transition-all ease-in duration-300',
                leaveToClass: 'opacity-0',
                moveClass: 'transition-all ease-out duration-300',
                onBeforeLeave: freeze,
            }"
            :items="filteredMovies"
        >
            <template #default="{ item: movie }">
                <MovieCard :movie />
            </template>

            <template #empty>
                <MoviesEmptyState :empty-collection="hasEmptyCollection" @clear-filters="clearAllFilters()" />
            </template>
        </VirtualMediaGrid>
        <MoviesTable v-else :movies="filteredMovies" class="mt-2">
            <template #empty>
                <MoviesEmptyState :empty-collection="hasEmptyCollection" @clear-filters="clearAllFilters()" />
            </template>
        </MoviesTable>
    </Page>
</template>

<script setup lang="ts">
import { UI, useLoading } from '@aerogel/core';
import { useModelCollection } from '@aerogel/plugin-solid';
import { computed, ref, TransitionGroup } from 'vue';
import IconSync from '~icons/mdi/sync';
import IconUpload from '~icons/mdi/upload';

import FilterMoviesModal from '@/components/modals/FilterMoviesModal.vue';
import ImportMediaModal from '@/components/modals/ImportMediaModal.vue';
import {
    createMovieSearchEntry,
    hasActiveMovieFilters,
    movieMatchesFilters,
    movieMatchesQuery,
    toMovieSearchText,
    type MoviesFilter,
} from '@/lib/movies';
import Movie from '@/models/Movie';

const quickFilter = ref<string | null>(null);
const advancedFilters = ref<MoviesFilter | null>(null);
const allMovies = useModelCollection(Movie);
const hasEmptyCollection = computed(() => allMovies.value.length === 0);
const hasAdvancedFilters = computed(() => hasActiveMovieFilters(advancedFilters.value));

const moviesSearchIndex = computed(() => allMovies.value.map(createMovieSearchEntry));
const filteredMovies = computed(() => {
    if (!quickFilter.value && !hasAdvancedFilters.value) {
        return allMovies.value;
    }

    const searchQuery = quickFilter.value && toMovieSearchText(quickFilter.value);

    return moviesSearchIndex.value
        .filter((entry) => movieMatchesQuery(entry, searchQuery) && movieMatchesFilters(entry, advancedFilters.value))
        .map((entry) => entry.movie);
});
const display = ref<'grid' | 'table'>('grid');
const { loading: syncing, run: runSync } = useLoading();

async function updateAdvancedFilters() {
    await Promise.all(
        allMovies.value.map(async (movie) => {
            await movie.loadRelationIfUnloaded('actors');
            await movie.loadRelationIfUnloaded('directors');
            await movie.loadRelationIfUnloaded('watchActions');
        }),
    );

    const { filters } = await UI.modal(FilterMoviesModal, {
        filters: advancedFilters.value,
        movies: allMovies.value,
    });

    if (filters) {
        advancedFilters.value = filters;
    }
}

function freeze(movie: HTMLElement) {
    const { clientWidth, offsetTop, offsetLeft } = movie;

    movie.style.position = 'absolute';
    movie.style.width = `${clientWidth}px`;
    movie.style.top = `${offsetTop}px`;
    movie.style.left = `${offsetLeft}px`;
    movie.style.transformOrigin = 'top left';
    movie.style.pointerEvents = 'none';
}

function clearAllFilters() {
    quickFilter.value = null;
    advancedFilters.value = null;
}
</script>
