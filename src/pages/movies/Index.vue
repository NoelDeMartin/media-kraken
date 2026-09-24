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
                        click: () => runSync($catalog.syncIfNeeded(movies)),
                    },
                ]"
            >
                <Button
                    size="icon"
                    variant="ghost"
                    :title="$t('movies.openActionsMenu')"
                    class="clickable -ml-3 rounded-md p-1"
                >
                    <i-mdi-dots-vertical class="size-5" />
                    <span class="sr-only">{{ $t('movies.openActionsMenu') }}</span>
                </Button>
            </DropdownMenu>
            <PageTitle>{{ $t('movies.title') }} ({{ movies.length }})</PageTitle>
            <div class="flex-1" />
            <Button
                @click="display = display === 'table' ? 'grid' : 'table'"
                variant="ghost"
                class="clickable -mr-3"
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
        </div>
        <VirtualMediaGrid v-if="display === 'grid'" v-slot="{ item: movie }" class="mt-2" by="url" :items="movies">
            <MovieCard :movie />
        </VirtualMediaGrid>
        <MoviesTable v-else :movies class="mt-2" />
    </Page>
</template>

<script setup lang="ts">
import { useLoading } from '@aerogel/core';
import { useModelCollection } from '@aerogel/plugin-solid';
import { ref } from 'vue';
import IconSync from '~icons/mdi/sync';
import IconUpload from '~icons/mdi/upload';

import ImportMediaModal from '@/components/modals/ImportMediaModal.vue';
import Movie from '@/models/Movie';

const movies = useModelCollection(Movie);
const display = ref<'grid' | 'table'>('grid');
const { loading: syncing, run: runSync } = useLoading();
</script>
