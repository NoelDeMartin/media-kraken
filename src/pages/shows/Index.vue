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
                        icon: IconSync,
                        label: $t('media.synchronizeAll'),
                        click: () =>
                            $ui.runJob(new SynchronizeMedia(allShows), {
                                message: $t('media.synchronizing'),
                            }),
                    },
                ]"
            >
                <Button size="icon" variant="ghost" :title="$t('shows.openActionsMenu')" class="-ml-3 rounded-md p-1">
                    <i-mdi-dots-vertical class="size-5" />
                    <span class="sr-only">{{ $t('shows.openActionsMenu') }}</span>
                </Button>
            </DropdownMenu>
            <PageTitle>{{ $t('shows.title') }} ({{ sortedShows.length }})</PageTitle>
            <div class="flex-1" />
            <div v-if="!hasEmptyCollection" class="-mr-3 flex items-center gap-1">
                <Button
                    @click="display = display === 'table' ? 'grid' : 'table'"
                    variant="ghost"
                    class="px-1.5"
                    :title="display === 'grid' ? $t('shows.viewList') : $t('shows.viewGrid')"
                >
                    <template v-if="display === 'grid'">
                        <i-mdi-view-grid class="size-6" />
                        <span class="sr-only">{{ $t('shows.viewList') }}</span>
                    </template>
                    <template v-else>
                        <i-mdi-view-list class="size-6" />
                        <span class="sr-only">{{ $t('shows.viewGrid') }}</span>
                    </template>
                </Button>
                <Button
                    variant="ghost"
                    :title="$t('shows.advancedFilters.button')"
                    :class="{ 'text-primary-500': hasAdvancedFilters }"
                    class="relative px-1.5"
                    @click="updateAdvancedFilters()"
                >
                    <i-mdi-filter class="size-6" />
                    <span
                        v-if="hasAdvancedFilters"
                        class="bg-primary-500 pointer-events-none absolute top-1.5 right-1.5 size-2 rounded-full ring-2 ring-white"
                    />
                    <span class="sr-only">{{ $t('shows.advancedFilters.button') }}</span>
                </Button>
                <FluidSearch
                    v-model="quickFilter"
                    :placeholder="$t('shows.quickFilter')"
                    :label="$t('shows.quickFilterTitle')"
                    :searching-label="$t('shows.quickFilterLabel')"
                    searching-class="pr-3"
                />
            </div>
        </div>
        <div v-if="loading && allShows.length === 0" class="flex items-center justify-center py-16">
            <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
        </div>
        <VirtualMediaGrid
            v-else-if="display === 'grid'"
            by="url"
            class="mt-2"
            :items="sortedShows"
            :animate="!loading"
        >
            <template #default="{ item: show }">
                <ShowCard :show />
            </template>

            <template #empty>
                <ShowsEmptyState :empty-collection="hasEmptyCollection" @clear-filters="clearAllFilters()" />
            </template>
        </VirtualMediaGrid>
        <ShowsTable v-else :shows="sortedShows" class="mt-2">
            <template #empty>
                <ShowsEmptyState :empty-collection="hasEmptyCollection" @clear-filters="clearAllFilters()" />
            </template>
        </ShowsTable>
    </Page>
</template>

<script setup lang="ts">
import { UI } from '@aerogel/core';
import { useModels } from '@aerogel/plugin-solid';
import { arraySorted } from '@noeldemartin/utils';
import { computed, ref } from 'vue';
import IconSync from '~icons/mdi/sync';

import FilterShowsModal from '@/components/modals/FilterShowsModal.vue';
import SynchronizeMedia from '@/jobs/SynchronizeMedia';
import { toSearchText } from '@/lib/media';
import {
    createShowSearchEntry,
    hasActiveShowFilters,
    showMatchesFilters,
    showMatchesQuery,
    type ShowsFilter,
} from '@/lib/shows';
import Show from '@/models/Show';

const quickFilter = ref<string | null>(null);
const advancedFilters = ref<ShowsFilter | null>(null);
const { models: allShows, loading } = useModels(Show);
const hasEmptyCollection = computed(() => !loading.value && allShows.value.length === 0);
const hasAdvancedFilters = computed(() => hasActiveShowFilters(advancedFilters.value));

const showsSearchIndex = computed(() => allShows.value.map(createShowSearchEntry));
const filteredShows = computed(() => {
    if (!quickFilter.value && !hasAdvancedFilters.value) {
        return allShows.value;
    }

    const searchQuery = quickFilter.value && toSearchText(quickFilter.value);

    return showsSearchIndex.value
        .filter((entry) => showMatchesQuery(entry, searchQuery) && showMatchesFilters(entry, advancedFilters.value))
        .map((entry) => entry.show);
});
const sortedShows = computed(() => arraySorted(filteredShows.value, 'createdAt', 'desc'));
const display = ref<'grid' | 'table'>('grid');

async function updateAdvancedFilters() {
    const { filters } = await UI.modal(FilterShowsModal, {
        filters: advancedFilters.value,
        shows: allShows.value,
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
