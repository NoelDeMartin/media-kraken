<template>
    <MovieDetails v-if="movie" :movie="movie" />
    <NotFound v-else />
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import MovieDetails from '@/components/MovieDetails.vue';
import NotFound from '@/components/NotFound.vue';

export default Vue.extend({
    components: {
        MovieDetails,
        NotFound,
    },
    props: {
        movieUuid: {
            type: String,
            required: true,
        },
    },
    computed: {
        movie(): Movie | null {
            return this.$media.movies.find(movie => movie.uuid === this.movieUuid) || null;
        },
    },
});
</script>
