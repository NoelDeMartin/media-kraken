<template>
    <AppModal :id="id" :options="options" title="Kickstart">
        <p class="text-gray-700 leading-relaxed mb-3">
            Ok, if you really don't know where to start I can help you. I understand
            how intimidating a blank canvas can be!
        </p>
        <p class="text-gray-700 leading-relaxed mb-4">
            Using the button below, I'll add the top 100 rated movies from IMDb to your collection. But after this,
            you're not getting any more suggestions from me! Ask your friends for recommendations, and every time that
            you come accross something you like, come back to save it. Never forget a movie again!
        </p>
        <BaseButton
            class="
                border border-primary-500 text-sm text-primary-700 justify-center
                hover:bg-black-overlay
            "
            @click="importImdbTop100RatedMovies"
        >
            Add the top 100 rated movies from IMDb to my collection
        </BaseButton>
    </AppModal>
</template>

<script lang="ts">
import Modal from '@/components/mixins/Modal';

import { MediaSource } from '@/services/Media';

import imdbTop100RatedMovies from '@/assets/data/imdb-top-100-rated-movies.json';

export default Modal.extend({
    methods: {
        async importImdbTop100RatedMovies() {
            await this.$media.importMovies(imdbTop100RatedMovies, MediaSource.JSONLD);

            this.close();
        },
    },
});
</script>
