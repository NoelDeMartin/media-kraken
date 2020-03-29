<template>
    <main>
        <BasePageHeader class="-mx-2 mb-2">
            <BaseMenu
                slot="before"
                :options="[
                    { id: 'import', text: 'Import to collection', icon: 'upload', handle: importMedia },
                    { id: 'export', text: 'Export collection', icon: 'download', handle: exportCollection },
                ]"
            >
                <BaseButton
                    icon="more"
                    class="h-8 mr-1 hover:bg-black-overlay"
                    style="padding:0; width:1.125rem"
                />
            </BaseMenu>

            Collection ({{ $media.movies.length }})
        </BasePageHeader>
        <MoviesGrid :movies="$media.movies" :within-collection="true" />
    </main>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import Files from '@/utils/Files';

import MoviesGrid from '@/components/MoviesGrid.vue';
import ImportMediaModal from '@/components/modals/ImportMediaModal.vue';

export default Vue.extend({
    components: {
        MoviesGrid,
    },
    methods: {
        importMedia() {
            this.$ui.openModal(ImportMediaModal);
        },
        exportCollection() {
            Files.download(
                'my-collection.json',
                JSON.stringify(this.$media.movies.map(movie => movie.toJSON())),
            );
        },
    },
});
</script>
