<template>
    <main>
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
    </main>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import MoviesGrid from '@/components/MoviesGrid.vue';

export default Vue.extend({
    components: {
        MoviesGrid,
    },
    computed: {
        pendingMovies(): Movie[] {
            return this.$media.movies.filter(movie => !movie.watched);
        },
    },
});
</script>
