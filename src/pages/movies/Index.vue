<template>
    <Page :fullbleed="display === 'table'">
        <div
            class="max-w-screen-content mx-auto flex w-full items-center justify-start"
            :class="{ 'px-edge': display === 'table' }"
        >
            <i-mdi-sync v-if="loading" class="mr-1 size-5 animate-spin" />
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
                        label: $t('media.synchronizeAll'),
                        click: () =>
                            $ui.runJob(new SynchronizeMedia(allMovies), {
                                message: $t('media.synchronizing'),
                            }),
                    },
                ]"
            >
                <Button size="icon" variant="ghost" :title="$t('movies.openActionsMenu')" class="-ml-3 rounded-md p-1">
                    <i-mdi-dots-vertical class="size-5" />
                    <span class="sr-only">{{ $t('movies.openActionsMenu') }}</span>
                </Button>
            </DropdownMenu>
            <PageTitle>{{ $t('movies.title') }} ({{ sortedMovies.length }})</PageTitle>
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
        <div v-if="loading && allMovies.length === 0" class="flex items-center justify-center py-16">
            <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
        </div>
        <VirtualMediaGrid
            v-else-if="display === 'grid'"
            by="url"
            class="mt-2"
            :items="sortedMovies"
            :animate="!loading"
        >
            <template #default="{ item: movie }">
                <MovieCard :movie />
            </template>

            <template #empty>
                <MoviesEmptyState :empty-collection="hasEmptyCollection" @clear-filters="clearAllFilters()" />
            </template>
        </VirtualMediaGrid>
        <MoviesTable v-else :movies="sortedMovies" class="mt-2">
            <template #empty>
                <MoviesEmptyState :empty-collection="hasEmptyCollection" @clear-filters="clearAllFilters()" />
            </template>
        </MoviesTable>
    </Page>
</template>

<script setup lang="ts">
import { UI } from '@aerogel/core';
import { useModels } from '@aerogel/plugin-solid';
import { arraySorted } from '@noeldemartin/utils';
import { computed, ref } from 'vue';
import IconSync from '~icons/mdi/sync';
import IconUpload from '~icons/mdi/upload';

import FilterMoviesModal from '@/components/modals/FilterMoviesModal.vue';
import ImportMediaModal from '@/components/modals/ImportMediaModal.vue';
import SynchronizeMedia from '@/jobs/SynchronizeMedia';
import { toSearchText } from '@/lib/media';
import {
    createMovieSearchEntry,
    hasActiveMovieFilters,
    movieMatchesFilters,
    movieMatchesQuery,
    type MoviesFilter,
} from '@/lib/movies';
import Movie from '@/models/Movie';

const quickFilter = ref<string | null>(null);
const advancedFilters = ref<MoviesFilter | null>(null);
const { models: allMovies, loading } = useModels(Movie);
const hasEmptyCollection = computed(() => !loading.value && allMovies.value.length === 0);
const hasAdvancedFilters = computed(() => hasActiveMovieFilters(advancedFilters.value));

const moviesSearchIndex = computed(() => allMovies.value.map(createMovieSearchEntry));
const filteredMovies = computed(() => {
    if (!quickFilter.value && !hasAdvancedFilters.value) {
        return allMovies.value;
    }

    const searchQuery = quickFilter.value && toSearchText(quickFilter.value);

    return moviesSearchIndex.value
        .filter((entry) => movieMatchesQuery(entry, searchQuery) && movieMatchesFilters(entry, advancedFilters.value))
        .map((entry) => entry.movie);
});
const sortedMovies = computed(() => arraySorted(filteredMovies.value, 'createdAt', 'desc'));
const display = ref<'grid' | 'table'>('grid');

async function updateAdvancedFilters() {
    const { filters } = await UI.modal(FilterMoviesModal, {
        filters: advancedFilters.value,
        movies: allMovies.value,
    });

    if (filters) {
        advancedFilters.value = filters;
    }
}

function clearAllFilters() {
    quickFilter.value = null;
    advancedFilters.value = null;
}
</script>
