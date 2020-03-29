<template>
    <div>
        <div class="flex grid gap-4 grid-cols-fill-32 desktop:grid-cols-fill-40">
            <div v-for="source of sources" :key="source" class="relative ratio-1/1">
                <div class="absolute inset-0 flex">
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
                        @click="$ui.openMarkdownModal('import-' + source, helpReplacements[source])"
                    >
                        <BaseIcon name="question" class="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div class="relative ratio-1/1">
                <a
                    target="_blank"
                    href="https://github.com/noeldemartin/media-kraken/issues/new?title=Add+new+import+option"
                    class="
                        absolute inset-0 flex flex-col items-center justify-center p-4
                        shadow border border-gray-400 hover:bg-gray-300
                    "
                >
                    <BaseIcon name="github" class="w-16 h-16 text-gray-800" />
                    <span class="mt-4 text-gray-700 text-center font-medium">
                        Others
                    </span>
                </a>
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

import Files, { MediaType } from '@/utils/Files';

export default Vue.extend({
    data: () => ({
        sources: Object.values(MediaSource),
    }),
    computed: {
        mediaSourceNames: () => mediaSourceNames,
        helpReplacements(): any {
            const repositoryUrl = 'https://github.com/NoelDeMartin/media-kraken';
            const filePath = 'src/models/third-party/JSONMovie.ts';
            const branch = this.$config.isDevelopment ? 'master' : this.$config.version;

            return {
                json: {
                    url: `${repositoryUrl}/blob/${branch}/${filePath}`,
                },
            };
        },
    },
    methods: {
        async importMedia(source: MediaSource) {
            try {
                // TODO show progress
                const movies = await this.$ui.loading(
                    () => this.importMovies(source),
                    'Importing movies...',
                );

                // TODO canceling file picker doesn't return nor reject
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
            const data = await Files.upload({ accept: MediaType.JSON });
            const thirdPartyMovies = JSON.parse(data)
                .filter((movieData: any) => JSONMovie.isValidData(movieData))
                .map((movieData: any) => new JSONMovie(movieData));

            return this.$media.importMovies(thirdPartyMovies);
        },
        async importMoviesFromTViso(): Promise<Movie[]> {
            const data = await Files.upload({ accept: MediaType.JSON });
            const thirdPartyMovies = JSON.parse(data)
                .filter((movieData: any) => TVisoMovie.isValidData(movieData))
                .map((movieData: any) => new TVisoMovie(movieData));

            return this.$media.importMovies(thirdPartyMovies);
        },
    },
});
</script>
