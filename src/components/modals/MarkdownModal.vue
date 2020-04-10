<template>
    <AppModal :id="id" :options="options" :title="title">
        <MarkdownContent
            v-if="body"
            :content="body"
            class="markdown-modal-content"
            @custom-trigger="handleCustomTrigger($event)"
        />
        <LoadingCircle v-else class="w-8 h-8 text-primary-700" />
    </AppModal>
</template>

<script lang="ts">
import Modal from '@/components/mixins/Modal';

import LoadingCircle from '@/components/LoadingCircle.vue';
import MarkdownContent from '@/components/MarkdownContent.vue';

interface Data {
    title: string | null;
    body: string | null;
}

export default Modal.extend({
    components: {
        LoadingCircle,
        MarkdownContent,
    },
    props: {
        file: {
            type: String,
            default: null,
        },
        content: {
            type: String,
            default: null,
        },
        replacements: {
            type: Object,
            default: () => ({}),
        },
        handleCustomTrigger: {
            type: Function as unknown as () => (trigger: string) => void,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            default: () => () => {},
        },
    },
    data: (): Data => ({
        title: null,
        body: null,
    }),
    async created() {
        const markdown = this.file
            ? (await import(`@/assets/markdown/${this.file}.md`)).default
            : (this.content || '');

        this.loadMarkdown(markdown);
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

            this.body = markdown;
        },
    },
});
</script>

<style lang="scss">
    .markdown-modal-content {
        @apply flex flex-col;

        h2, h3, h4, p {
            @apply mb-3;
        }

        & > p:last-child {
            @apply mb-0;
        }

        h2 {
            @apply font-semibold text-primary-900;
        }

        li, p {
            @apply text-sm text-gray-700 leading-relaxed;
        }

        ul, ol {
            @apply list-inside;
        }

        ul {
            @apply list-disc;
        }

        ol {
            @apply list-decimal;
        }

        a, button.link {
            @apply text-primary-700;

            &:hover {
                @apply text-primary-900 underline;
            }

        }

        code {
            @apply block bg-gray-200 p-2 text-xs rounded mt-1 mb-4;
            word-break: break-all;
        }

    }
</style>
