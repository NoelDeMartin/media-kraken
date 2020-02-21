<template>
    <main v-if="movie" class="flex flex-col items-center w-full h-full">
        <h1 class="text-2xl font-semibold mb-4 text-center">
            {{ movie.title }}
        </h1>
        <img :src="movie.posterUrl" class="w-48">
    </main>
    <NotFound v-else />
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import NotFound from '@/pages/errors/404.vue';

export default Vue.extend({
    components: {
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
