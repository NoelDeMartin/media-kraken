<template>
    <main class="flex flex-col items-center w-full h-full">
        <h1 class="text-2xl font-semibold mb-4 text-center">
            Search Results for "{{ query }}"
        </h1>
        <template v-if="results">
            <p class="mb-4">
                Found {{ results.length }} results:
            </p>
            <ul>
                <!-- TODO handle movies that are already in the collection differently -->
                <li
                    v-for="(result, i) of results"
                    :key="i"
                    class="flex mb-4 bg-white p-4 rounded"
                >
                    <div
                        :style="{
                            'background-image': `url('${result.posterUrl}')`,
                        }"
                        class="bg-cover bg-center w-16 h-16 rounded mr-4"
                    />
                    <div class="flex flex-col items-start justify-center">
                        <span class="mb-1">{{ result.title }}</span>

                        <button
                            type="button"
                            class="text-xs text-white rounded bg-green-500 px-2 py-1 hover:bg-green-700"
                            @click="importResult(result)"
                        >
                            Add to collection
                        </button>
                    </div>
                </li>
            </ul>
        </template>
        <p v-else>
            Loading...
        </p>
    </main>
</template>

<script lang="ts">
import Vue from 'vue';

import TheMovieDBApi from '@/api/TheMovieDBApi';

import TheMovieDBMovie from '@/models/third-party/TheMovieDBMovie';

interface Data {
    query: string;
    results: null | TheMovieDBMovie[];
}

export default Vue.extend({
    data: (): Data => ({
        query: new URL(location.href).searchParams.get('query') || '',
        results: null,
    }),
    async created() {
        const response = await TheMovieDBApi.searchMovies(this.query);

        this.results = response.results.map(data => new TheMovieDBMovie(data));
    },
    methods: {
        async importResult(result: TheMovieDBMovie) {
            // TODO catch errors

            const movie = await result.import(this.$media.moviesContainer!);
            const { imdb_id } = await TheMovieDBApi.getExternalMovieIds(result.id);

            await movie.update({
                externalUrls: [
                    ...movie.externalUrls,
                    'https://www.imdb.com/title/' + imdb_id,
                ],
            });

            this.$router.push({ name: 'movies.show', params: { uuid: movie.uuid as string } });
        },
    },
});
</script>
