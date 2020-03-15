<template>
    <div v-if="!$media.empty">
        <h1 class="text-2xl font-semibold mb-4 text-center">
            Movies To Watch
        </h1>
        <div class="overflow-y-auto text-center">
            <MoviesGrid :movies="pendingMovies" />
            <router-link
                :to="{ name: 'collection' }"
                class="underline text-blue-700 hover:text-blue-900"
            >
                View all
            </router-link>
        </div>
    </div>

    <div v-else class="flex flex-col flex-grow w-full">
        <span class="block text-2xl font-bold my-4">Welcome!</span>
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
