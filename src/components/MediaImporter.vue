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
                        @click="$ui.openFileMarkdownModal('import-' + source, helpReplacements[source])"
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

import { MediaSource } from '@/services/Media';

import Files, { MediaType } from '@/utils/Files';

export default Vue.extend({
    data: () => ({
        sources: Object.values(MediaSource),
    }),
    computed: {
        mediaSourceNames: () => ({
            [MediaSource.TViso]: 'TViso',
            [MediaSource.JSON]: 'JSON',
        }),
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
            const filecontents = await Files.upload({ accept: MediaType.JSON });
            if (filecontents === null)
                return;

            const data = JSON.parse(filecontents);
            if (!Array.isArray(data))
                throw new Error('Invalid file format, expecting array');

            await this.$media.importMovies(data, source);

            this.$emit('imported');
        },
    },
});
</script>
