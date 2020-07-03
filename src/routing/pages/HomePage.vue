<template>
    <div v-if="!$media.loaded">
        <!--
            Show empty page when loading, it should not take long and it's
            better than showing a loader that'll disappear too fast.
        -->
    </div>

    <div v-else-if="pendingMovies.length > 0">
        <BasePageHeader>Watch next:</BasePageHeader>
        <MoviesGrid :movies="pendingMoviesSummary" />
        <p v-if="pendingMovies.length > pendingMoviesSummary.length" class="mt-3 leading-relaxed max-w-readable">
            You have more movies to watch in <BaseLink route="collection">
                your collection
            </BaseLink>.
        </p>
    </div>

    <div v-else-if="!$media.empty">
        <BasePageHeader>All done!</BasePageHeader>
        <p class="leading-relaxed">
            You don't have anything pending to watch! Check <BaseLink route="collection">
                your collection
            </BaseLink> to rewatch some of your favourites
            or press "s" to find something new.
        </p>
    </div>

    <div v-else class="flex flex-col flex-grow w-full">
        <BasePageHeader>Welcome to Media Kraken!</BasePageHeader>
        <p class="mb-3 leading-relaxed max-w-readable">
            I will help you keep track of your movies so that you don't have to. But there's a catch,
            you'll only find <span class="font-medium">your movies</span> here. I won't do like those sites
            that make suggestions and show you what's new. Only you can put movies in your collection!
        </p>
        <p class="mb-3 leading-relaxed max-w-readable">
            To start adding movies to your collection, you can import them from the following sources:
        </p>
        <MediaImporter class="mb-8" />
        <p class="mb-4 leading-relaxed max-w-readable">
            If you don't have anything to import, just press "s" and start searching.
        </p>
        <p class="mb-2 leading-relaxed max-w-readable">
            <span class="font-medium">Still not sure what to do?</span> Ok, let's get started with
            the 100 Top Rated Movies from IMDB:
        </p>
        <BaseButton
            class="
                border border-primary-500 text-sm text-primary-700 justify-center max-w-readable
                hover:bg-black-overlay
            "
            @click="importImdbTop100Movies()"
        >
            Import 100 Top Rated Movies
        </BaseButton>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import { MediaSource } from '@/services/Media';

import imdbTop100Data from '@/assets/data/imdb-top-100.json';

import MediaImporter from '@/components/MediaImporter.vue';
import MoviesGrid from '@/components/MoviesGrid.vue';

export default Vue.extend({
    components: {
        MediaImporter,
        MoviesGrid,
    },
    computed: {
        pendingMovies(): Movie[] {
            return this.$media.movies.filter(movie => movie.pending).reverse();
        },
        pendingMoviesSummary(): Movie[] {
            return this.pendingMovies.slice(0, 10);
        },
    },
    methods: {
        importImdbTop100Movies() {
            this.$media.importMovies(imdbTop100Data, MediaSource.IMDB);
        },
    },
});
</script>
