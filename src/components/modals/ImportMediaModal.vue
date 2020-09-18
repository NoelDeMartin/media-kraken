<template>
    <AppModal
        :id="id"
        :options="options"
        class="w-full"
        title="Import Movies"
    >
        <p class="text-gray-700 leading-relaxed mb-3">
            You can import movies from the following sources:
        </p>
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
        <p class="text-gray-700 leading-relaxed my-3">
            If you can't import your movies with any of these options, please
            <BaseLink url="https://github.com/NoelDeMartin/media-kraken/issues/new?title=Support+importing+movies+from+...">
                let me know
            </BaseLink> and I'll help you.
        </p>
        <p class="text-gray-700 leading-relaxed">
            In the meantime, you can probably find your movies <BaseLink @click="openSearch">
                using the search in the header
            </BaseLink>.
        </p>
    </AppModal>
</template>

<script lang="ts">
import { MediaSource } from '@/services/Media';

import ImportIMDBMoviesModal from '@/components/modals/ImportIMDBMoviesModal.vue';
import Modal from '@/components/mixins/Modal';

import Files, { MediaType } from '@/utils/Files';
import Time from '@/utils/Time';

export default Modal.extend({
    data: () => ({
        sources: Object.values(MediaSource),
    }),
    computed: {
        mediaSourceNames: () => ({
            [MediaSource.JSONLD]: 'JSON-LD',
            [MediaSource.TViso]: 'TViso',
            [MediaSource.IMDB]: 'IMDB',
        }),
        helpReplacements(): any {
            const repositoryUrl = 'https://github.com/NoelDeMartin/media-kraken';
            const filePath = 'docs#data-schema';
            const branch = this.$app.isDevelopment ? 'main' : this.$app.version;

            return {
                jsonld: {
                    url: `${repositoryUrl}/blob/${branch}/${filePath}`,
                },
            };
        },
    },
    methods: {
        async openSearch() {
            this.close();

            // Wait for the modal to be hidden.
            await Time.wait(350);

            this.$search.start();
        },
        async importMedia(source: MediaSource) {
            const data = await this.getSourceData(source);

            if (data.length === 0)
                return;

            await this.$media.importMovies(data, source);

            this.close();
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
            const modal = this.$ui.openModal<object[]>(ImportIMDBMoviesModal);
            const data = await modal.result;

            return data || [];
        },
    },
});
</script>
