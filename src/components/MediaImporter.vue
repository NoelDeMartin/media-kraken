<template>
    <div>
        <span class="block font-semibold mb-4 text-gray-800 text-sm">Importing options:</span>
        <div class="flex grid gap-4 grid-cols-fit-40">
            <div v-for="source of sources" :key="source" class="relative flex w-40 h-40">
                <button
                    type="button"
                    class="
                        relative flex items-center justify-center w-full h-full
                        shadow border border-gray-400 hover:bg-gray-300
                    "
                    :title="'Import from ' + mediaSourceNames[source]"
                    @click="importMedia(source)"
                >
                    <BaseIcon :name="source" class="w-24 h-24" />
                </button>
                <button
                    type="button"
                    class="absolute top-0 right-0 m-2 text-blue-400 hover:text-blue-600"
                    title="Get help about this import method"
                    @click="showHelp(source)"
                >
                    <BaseIcon name="question" class="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/soukai/Movie';

import { MediaSource, mediaSourceNames } from '@/models/third-party/ThirdPartyMedia';
import JSONMovie from '@/models/third-party/JSONMovie';
import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';
import TVisoMovie from '@/models/third-party/TVisoMovie';

import FilePicker from '@/utils/FilePicker';

import HelpImport from '@/modals/HelpImport.vue';

export default Vue.extend({
    data: () => ({
        sources: Object.values(MediaSource),
    }),
    computed: {
        mediaSourceNames: () => mediaSourceNames,
    },
    methods: {
        async importMedia(source: MediaSource) {
            try {
                const movies = await this.importMovies(source);

                if (movies.length === 0)
                    throw new Error('Nothing was imported');

                this.$emit('imported', movies);
            } catch (error) {
                alert(error.message || 'Something went wrong');
            }
        },
        async importMovies(source: MediaSource): Promise<Movie[]> {
            switch (source) {
                case MediaSource.TViso:
                    return this.importMoviesFromTViso();
                case MediaSource.JSON:
                    return this.importMoviesFromJSON();
            }
        },
        async importMoviesFromJSON(): Promise<Movie[]> {
            const data = await FilePicker.upload({ accept: '.json' });
            const thirdPartyMovies = JSON.parse(data)
                .filter((movieData: any) => JSONMovie.isValidData(movieData))
                .map((movieData: any) => new JSONMovie(movieData));

            return this.$media.importMovies(thirdPartyMovies);
        },
        async importMoviesFromTViso(): Promise<Movie[]> {
            const data = await FilePicker.upload({ accept: '.json' });
            const thirdPartyMovies = JSON.parse(data)
                .filter((movieData: any) => TVisoMovie.isValidData(movieData))
                .map((movieData: any) => new TVisoMovie(movieData));

            return this.$media.importMovies(thirdPartyMovies);
        },
        showHelp(source: MediaSource) {
            this.$ui.openModal(HelpImport, { source });
        },
    },
});
</script>
