<template>
    <router-link :to="{ name: 'movie', params: { uuid: movie.uuid } }" class="relative group">
        <MoviePoster :url="movie.posterUrl" :title="movie.title" />
        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-25" />
        <div
            class="absolute top-0 right-0 -mt-1 w-10 h-10 flex items-center justify-center"
            style="margin-right:-.7rem"
        >
            <BaseIcon
                name="bookmark"
                class="absolute inset-0 w-10 h-10"
                :class="{
                    'text-green-300': movie.watched,
                    'text-blue-300': !movie.watched,
                }"
            />
            <BaseIcon
                class="w-4 h-4 z-10"
                :name="movie.watched ? 'checkmark' : 'time'"
                :class="{
                    'text-green-600': movie.watched,
                    'text-blue-600': !movie.watched,
                }"
            />
        </div>
    </router-link>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import MoviePoster from '@/components/MoviePoster.vue';

export default Vue.extend({
    components: {
        MoviePoster,
    },
    props: {
        movie: {
            type: Movie,
            required: true,
        },
    },
});
</script>
