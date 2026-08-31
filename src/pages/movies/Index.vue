<template>
    <Page>
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-semibold text-slate-900">{{ $t('movies.title') }} ({{ movies.length }})</h1>
            <DropdownMenu
                align="end"
                :options="[
                    {
                        label: $t('movies.import'),
                        icon: IconUpload,
                        click: openImportModal,
                    },
                ]"
            >
                <Button
                    size="icon"
                    variant="ghost"
                    :aria-label="$t('movies.openActionsMenu')"
                    :title="$t('movies.openActionsMenu')"
                >
                    <i-mdi-dots-vertical class="size-5" />
                </Button>
            </DropdownMenu>
        </div>
        <VirtualMediaGrid v-slot="{ item: movie }" class="mt-6" by="url" :items="movies">
            <MovieCard :movie />
        </VirtualMediaGrid>
    </Page>
</template>

<script setup lang="ts">
import { UI } from '@aerogel/core';
import { useModelCollection } from '@aerogel/plugin-solid';
import IconUpload from '~icons/mdi/upload';

import ImportMoviesModal from '@/components/modals/ImportMoviesModal.vue';
import Movie from '@/models/Movie';

const movies = useModelCollection(Movie);

function openImportModal() {
    UI.modal(ImportMoviesModal);
}
</script>
