<template>
    <AppModal :id="id" :options="options" :title="title">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="body" class="markdown-content" v-html="body" />
        <LoadingCircle v-else class="w-8 h-8 text-primary-700" />
    </AppModal>
</template>

<script lang="ts">
import Vue from 'vue';

import { ModalOptions } from '@/services/UI';

import Markdown from '@/utils/Markdown';

import AppModal from '@/components/AppModal.vue';
import LoadingCircle from '@/components/LoadingCircle.vue';

interface Data {
    title: string | null;
    body: string | null;
}

export default Vue.extend({
    components: {
        AppModal,
        LoadingCircle,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        options: {
            type: Object as () => ModalOptions,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        replacements: {
            type: Object,
            default: () => ({}),
        },
    },
    data: (): Data => ({
        title: null,
        body: null,
    }),
    async created() {
        const { default: markdown } = await import(`@/assets/markdown/${this.content}.md`);

        this.loadMarkdown(markdown.trim());
    },
    methods: {
        loadMarkdown(markdown: string) {
            if (markdown.startsWith('# ')) {
                const secondLineIndex = markdown.indexOf('\n');

                this.title = markdown.substring(2, secondLineIndex);
                markdown = markdown.substring(secondLineIndex + 1);
            }

            for (const [name, value] of Object.entries(this.replacements)) {
                markdown = markdown.replace(`%${name}%`, value as any);
            }

            this.body = Markdown.render(markdown);
        },
    },
});
</script>

<style lang="scss">
    .markdown-content {
        @apply flex flex-col;

        h2, h3, h4, p {
            @apply mb-3;
        }

        h2 {
            @apply font-semibold text-primary-900;
        }

        p {
            @apply text-sm text-gray-700 leading-relaxed;
        }

        a {
            @apply text-primary-700;

            &:hover {
                @apply text-primary-900 underline;
            }

        }

    }
</style>
