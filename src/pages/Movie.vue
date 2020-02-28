<template>
    <main v-if="movie" class="flex flex-col items-center w-full h-full">
        <h1 class="text-2xl font-semibold mb-4 text-center">
            {{ movie.title }}
        </h1>
        <img :src="movie.posterUrl" class="w-48">
        <p v-if="movie.watched" class="mt-2">
            Watched on {{ movie.watchedAt.toDateString() }}
        </p>
        <p v-else class="mt-2">
            Pending
        </p>
        <div class="flex mt-3">
            <a
                v-for="(url, i) in movie.externalUrls"
                :key="i"
                :href="url"
                target="_blank"
                class="mr-2"
            >
                <img :src="getExternalUrlImage(url)" class="h-8">
            </a>
        </div>
    </main>
    <NotFound v-else />
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import NotFound from '@/pages/errors/404.vue';

const externalUrlLogos = {
    'https://www.themoviedb.org': 'themoviedb',
    'https://www.imdb.com/': 'imdb',
};

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
    methods: {
        getExternalUrlImage(externalUrl: string): string {
            for (const [url, name] of Object.entries(externalUrlLogos)) {
                if (!externalUrl.startsWith(url))
                    continue;

                return `/img/logos/${name}.png`;
            }

            return 'unknown.png';
        },
    },
});
</script>
