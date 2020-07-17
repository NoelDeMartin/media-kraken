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
                        v-if="source !== 'imdb'"
                        type="button"
                        class="absolute top-0 right-0 m-2 text-blue-400 hover:text-blue-600"
                        title="Get help about this import method"
                        @click="$ui.openFileMarkdownModal('import-' + source, helpReplacements[source])"
                    >
                        <BaseIcon name="question" class="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { MediaSource } from '@/services/Media';

import ImportMoviesData from '@/components/modals/ImportMoviesData.vue';

import Files, { MediaType } from '@/utils/Files';

export default Vue.extend({
    data: () => ({
        sources: Object.values(MediaSource),
    }),
    computed: {
        mediaSourceNames: () => ({
            [MediaSource.TViso]: 'TViso',
            [MediaSource.JSONLD]: 'JSON-LD',
            [MediaSource.IMDB]: 'IMDB',
        }),
        helpReplacements(): any {
            const repositoryUrl = 'https://github.com/NoelDeMartin/media-kraken';
            const filePath = 'docs#data-schema';
            const branch = this.$config.isDevelopment ? 'main' : this.$config.version;

            return {
                jsonld: {
                    url: `${repositoryUrl}/blob/${branch}/${filePath}`,
                },
            };
        },
    },
    methods: {
        async importMedia(source: MediaSource) {
            const data = await this.getSourceData(source);

            if (data.length === 0)
                return;

            await this.$media.importMovies(data, source);

            this.$emit('imported');
        },
        async getSourceData(source: MediaSource): Promise<object[]> {
            switch (source) {
                case MediaSource.IMDB:
                    return this.getDataFromModal();
                default:
                    return this.getDataFromFile();
            }
        },
        async getDataFromFile(): Promise<object[]> {
            const filecontents = await Files.upload({ accept: MediaType.JSON });
            if (filecontents === null)
                return [];

            const data = JSON.parse(filecontents);
            if (!Array.isArray(data))
                throw new Error('Invalid file format, expecting array');

            return data;
        },
        async getDataFromModal(): Promise<object[]> {
            const modal = this.$ui.openModal<object[]>(ImportMoviesData);
            const data = await modal.result;

            return data || [];
        },
    },
});
</script>
