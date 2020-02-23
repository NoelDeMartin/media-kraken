<template>
    <div class="flex flex-col w-full h-full">
        <header class="flex p-4">
            <router-link :to="{ name: 'home' }">
                <svg viewBox="0 0 20 20" class="w-4 h-4">
                    <path d="M8 20H3V10H0L10 0l10 10h-3v10h-5v-6H8v6z" />
                </svg>
            </router-link>
            <div class="flex-grow" />
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
        <router-view />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import FilePicker from '@/utils/FilePicker';

export default Vue.extend({
    methods: {
        async importMovies() {
            const data = await FilePicker.upload({ accept: '.json' });
            const moviesJson: any[] = JSON.parse(data);

            // TODO implement createMany in soukai
            await Promise.all(moviesJson.map(json => this.createMovieFromJson(json)));
        },
        async createMovieFromJson(json: any): Promise<void> {
            const attributes = {
                title: json.title,
                posterUrl: json.posterUrl,
                externalUrls: json.externalUrls || [],
            };

            // TODO parse watch actions

            await this.$media.moviesContainer!.createMovie(attributes);
        },
    },
});
</script>
