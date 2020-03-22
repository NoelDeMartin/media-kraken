<template>
    <div v-if="movie" class="flex mt-6">
        <MoviePoster class="w-64 rounded shadow flex-shrink-0 mr-4" :url="movie.posterUrl" />
        <div class="flex flex-col">
            <h1 class="text-2xl font-semibold mb-2">
                {{ movie.title }}
                <span v-if="movie.releaseDate" class="font-medium text-lg">
                    ({{ movie.releaseDate.getFullYear() }})
                </span>
            </h1>
            <p class="leading-relaxed text-gray-700">
                {{ movie.description || 'No description.' }}
            </p>
        </div>
    </div>
    <NotFound v-else />
</template>

<script lang="ts">
import Vue from 'vue';
import { Dayjs } from 'dayjs';

import Movie from '@/models/soukai/Movie';

import MoviePoster from '@/components/MoviePoster.vue';
import NotFound from '@/components/NotFound.vue';

export default Vue.extend({
    components: {
        MoviePoster,
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
