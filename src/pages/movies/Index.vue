<template>
    <Page>
        <div class="flex items-center justify-start">
            <DropdownMenu
                align="start"
                :options="[
                    {
                        icon: IconUpload,
                        label: $t('movies.import'),
                        click: () => $ui.modal(ImportMediaModal),
                    },
                ]"
            >
                <Button
                    size="icon"
                    variant="ghost"
                    :aria-label="$t('movies.openActionsMenu')"
                    :title="$t('movies.openActionsMenu')"
                    class="clickable -ml-3 rounded-md p-1"
                >
                    <i-mdi-dots-vertical class="size-5" />
                </Button>
            </DropdownMenu>
            <PageTitle>{{ $t('movies.title') }} ({{ movies.length }})</PageTitle>
        </div>
        <VirtualMediaGrid v-slot="{ item: movie }" class="mt-2" by="url" :items="movies">
            <MovieCard :movie />
        </VirtualMediaGrid>
    </Page>
</template>

<script setup lang="ts">
import { useModelCollection } from '@aerogel/plugin-solid';
import IconUpload from '~icons/mdi/upload';

import ImportMediaModal from '@/components/modals/ImportMediaModal.vue';
import Movie from '@/models/Movie';

const movies = useModelCollection(Movie);
</script>
