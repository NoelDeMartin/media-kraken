<template>
    <div class="flex flex-wrap justify-center -m-2 max-w-100">
        <MoviesGridItem
            v-for="movie of movies"
            :key="movie.id"
            :movie="movie"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/Movie';

import MoviesGridItem from '@/components/MoviesGridItem.vue';

export default Vue.extend({
    components: {
        MoviesGridItem,
    },
    props: {
        movies: {
            type: Array as () => Movie[],
            required: true,
        },
    },
});
</script>
