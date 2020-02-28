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
                @click="importMoviesFromJSON"
            >
                Import from JSON
            </button>
            <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                @click="importMoviesFromTViso"
            >
                Import from TViso
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
import TVisoMovie from '@/models/third-party/TVisoMovie';

import FilePicker from '@/utils/FilePicker';

export default Vue.extend({
    methods: {
        async importMoviesFromJSON() {
            // TODO validate json
            const data = await FilePicker.upload({ accept: '.json' });

            this.$media.importMovies(
                JSON.parse(data),
                'json',
                {
                    onStart: () => console.log('Start importing'),
                    onProgress: (current, total) => console.log(`Imported ${current}/${total}`),
                    onCompleted: (totalRaw, totalImported) => console.log(`Completed, ${totalImported}/${totalRaw} were imported successfully`),
                },
            );
        },
        async importMoviesFromTViso() {
            // TODO validate json

            const data = await FilePicker.upload({ accept: '.json' });

            this.$media.importMovies(
                JSON.parse(data).filter(TVisoMovie.isTVisoMovieData),
                'tviso',
                {
                    onStart: () => console.log('Start importing'),
                    onProgress: (current, total) => console.log(`Imported ${current}/${total}`),
                    onCompleted: (totalRaw, totalImported) => console.log(`Completed, ${totalImported}/${totalRaw} were imported successfully`),
                },
            );
        },
    },
});
</script>
