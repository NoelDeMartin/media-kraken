<template>
    <div v-if="pendingMovies.length > 0">
        <BasePageHeader>Watch next:</BasePageHeader>
        <MoviesGrid :movies="pendingMovies" />
    </div>

    <div v-else-if="!$media.empty">
        <BasePageHeader>All done!</BasePageHeader>
        <p class="leading-relaxed">
            You don't have anything pending to watch! Check out
            <BaseLink route="collection">
                your collection
            </BaseLink>
            or press "s" to start searching something new.
        </p>
    </div>

    <div v-else class="flex flex-col flex-grow w-full">
        <BasePageHeader>Welcome!</BasePageHeader>
        <p class="mb-4 leading-relaxed">
            To get started, import some movies to your collection. If you don't have
            anything to import, just press "s" and start searching.
        </p>
        <span class="block font-semibold mb-4 text-gray-800 text-sm">Importing options:</span>
        <MediaImporter />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import MediaImporter from '@/components/MediaImporter.vue';
import MoviesGrid from '@/components/MoviesGrid.vue';

export default Vue.extend({
    components: {
        MediaImporter,
        MoviesGrid,
    },
    computed: {
        // TODO adding watched movie shouldn't trigger this! (or it should not cause a transition)
        pendingMovies(): Movie[] {
            return this.$media.movies.filter(movie => movie.pending).reverse().slice(0, 10);
        },
    },
});
</script>
