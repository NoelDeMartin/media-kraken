<template>
    <div class="flex flex-col items-center max-w-readable self-center">
        <BasePageHeader>
            Media Kraken Viewer
        </BasePageHeader>
        <MarkdownContent :content="info" class="markdown-content--typography" />
        <form class="flex flex-col items-center max-w-lg w-full mt-4" @submit.prevent="submit">
            <input
                ref="collection-url-input"
                v-model="collectionUrl"
                placeholder="Movies collection url"
                class="
                    flex-grow self-stretch shadow p-2 rounded-lg border border-gray-300
                    focus:border-primary-500
                "
            >
            <BaseButton
                submit
                class="
                    flex-grow self-stretch h-10 shadow text-white mt-4
                    text-sm justify-center font-medium tracking-wide
                    bg-brand-solid-500 hover:bg-brand-solid-700
                "
            >
                Load collection
            </BaseButton>
            <p v-if="$viewer.collectionUrl" class="text-gray-700 text-sm mt-4 text-center">
                I couldn't find any movies at <BaseLink :url="$viewer.collectionUrl">
                    {{ $viewer.collectionUrl }}
                </BaseLink>, please try with a different url.
            </p>
        </form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import info from '@/assets/markdown/viewer.md';
import MarkdownContent from '@/components/MarkdownContent.vue';

interface Data {
    collectionUrl: string | null;
}

export default Vue.extend({
    components: {
        MarkdownContent,
    },
    data: (): Data => ({
        collectionUrl: null,
    }),
    computed: {
        info: () => info,
    },
    created() {
        this.collectionUrl = this.$viewer.collectionUrl;
    },
    mounted() {
        (this.$refs['collection-url-input'] as HTMLInputElement)?.focus();
    },
    methods: {
        submit() {
            if (!this.collectionUrl)
                return;

            if (!this.collectionUrl.startsWith('http'))
                this.collectionUrl = 'https://' + this.collectionUrl;

            if (!this.collectionUrl.endsWith('/'))
                this.collectionUrl += '/';

            this.$ui.loading(
                () => this.$viewer.view(this.collectionUrl!),
                'Loading collection...',
            );
        },
    },
});
</script>
