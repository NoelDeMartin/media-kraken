<template>
    <MoviesGrid
        v-if="pendingMovies.length > 0"
        class="mt-6"
        :movies="pendingMovies"
    />

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
        pendingMovies(): Movie[] {
            return this.$media.movies.filter(movie => !movie.watched);
        },
    },
});
</script>
