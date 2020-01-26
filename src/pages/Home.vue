<template>
    <div class="flex flex-col w-full h-full">
        <header class="flex justify-end p-4">
            <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                @click="importMovies"
            >
                Import
            </button>
            <button
                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                @click="$auth.logout()"
            >
                Logout
            </button>
        </header>
        <h1 class="text-2xl font-semibold mb-4 text-center">
            My Movies
        </h1>
        <div class="overflow-y-auto">
            <MoviesGrid :movies="$media.movies" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import FilePicker from '@/utils/FilePicker';

import MoviesGrid from '@/components/MoviesGrid.vue';

export default Vue.extend({
    components: {
        MoviesGrid,
    },
    methods: {
        async importMovies() {
            const data = await FilePicker.upload({ accept: '.json' });

            const moviesJson: any[] = JSON.parse(data);
            const movies = moviesJson.map(json => new Movie(json));

            // TODO use proper location
            await Promise.all(movies.map(movie => movie.save(this.$auth.user!.storages[0])));

            this.$media.addMovies(movies);
        },
    },
});
</script>
