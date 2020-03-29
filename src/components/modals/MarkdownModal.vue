<template>
    <!-- eslint-disable vue/no-v-html -->
    <AppModal :id="id" :options="options" :title="title">
        <div
            v-if="body"
            class="markdown-content"
            @click="contentClicked"
            v-html="body"
        />
        <LoadingCircle v-else class="w-8 h-8 text-primary-700" />
    </AppModal>
</template>

<script lang="ts">
import Modal from '@/components/mixins/Modal';

import Markdown from '@/utils/Markdown';

import LoadingCircle from '@/components/LoadingCircle.vue';

interface Data {
    title: string | null;
    body: string | null;
}

export default Modal.extend({
    components: {
        LoadingCircle,
    },
    props: {
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
        contentClicked(e: Event) {
            if (!(e.target instanceof HTMLElement) || !e.target.dataset.trigger)
                return;

            e.preventDefault();

            const [action, ...args] = e.target.dataset.trigger.split(':');

            switch (action) {
                case 'show-markdown':
                    this.$ui.openMarkdownModal(args[0]);
                    return;
            }
        },
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

        a, button.link {
            @apply text-primary-700;

            &:hover {
                @apply text-primary-900 underline;
            }

        }

    }
</style>
