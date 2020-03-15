<template>
    <AppModal class="p-4" @close="$ui.closeModal(id)">
        <span class="block font-semibold text-xl mb-2">
            Import from {{ mediaSourceNames[source] }}
        </span>
        <div v-if="source === 'tviso'" class="leading-relaxed text-gray-800">
            <p class="mb-2">
                <BaseLink :blank="true" href="https://es.tviso.com" class="underline">
                    TViso
                </BaseLink> is a web service that helps you track movies and tv shows. This application
                (Media Kraken) has been implemented as a replacement for TViso, given that
                <BaseLink :blank="true" href="https://blog.tviso.com/tenemos-que-hablar" class="underline">
                    they announced
                </BaseLink>
                their intention to close or sell the service.
            </p>
            <p>
                You can export your data from TViso
                <BaseLink :blank="true" href="https://es.tviso.com/my-settings/export-collection" class="underline">
                    here
                </BaseLink> (choose json format).
            </p>
        </div>
        <div v-else-if="source === 'json'" class="leading-relaxed text-gray-800">
            <p class="mb-2">
                If you are not able to import your data with the other options, you can upload a JSON file.
                Consult the format of the data
                <BaseLink :blank="true" :href="jsonFormatUrl" class="underline">
                    here
                </BaseLink>.
            </p>
            <p class="text-sm italic">
                Pro tip: If you want to inspect the format of a JSON file, you can use this wonderful
                <BaseLink :blank="true" href="https://jsoneditoronline.org" class="underline">
                    JSON Online Editor
                </BaseLink>.
            </p>
        </div>
    </AppModal>
</template>

<script lang="ts">
import Vue from 'vue';

import { MediaSource, mediaSourceNames } from '@/models/third-party/ThirdPartyMedia';

import AppModal from '@/components/AppModal.vue';

export default Vue.extend({
    components: {
        AppModal,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        source: {
            type: String as any as () => MediaSource,
            required: true,
        },
    },
    computed: {
        mediaSourceNames: () => mediaSourceNames,
        jsonFormatUrl(): string {
            const repositoryUrl = 'https://github.com/NoelDeMartin/media-kraken';
            const filePath = 'src/models/third-party/JSONMovie.ts';
            const branch = this.$config.isDevelopment ? 'master' : this.$config.version;

            return `${repositoryUrl}/blob/${branch}/${filePath}`;
        },
    },
});
</script>
