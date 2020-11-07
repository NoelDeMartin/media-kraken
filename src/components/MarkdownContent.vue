<template>
    <!-- eslint-disable vue/no-v-html -->
    <div
        v-if="html"
        class="markdown-content"
        @click="contentClicked"
        v-html="html"
    />
</template>

<script lang="ts">
import Vue from 'vue';

import Markdown from '@/utils/Markdown';

export default Vue.extend({
    props: {
        content: {
            type: String,
            required: true,
        },
    },
    computed: {
        html(): string {
            return Markdown.render(this.content);
        },
    },
    methods: {
        contentClicked(e: Event) {
            if (!(e.target instanceof HTMLElement))
                return;

            const trigger = this.getEventTrigger(e.target);

            if (!trigger || trigger.startsWith('http'))
                return;

            e.preventDefault();

            const [action, ...args] = trigger.split(':');

            switch (action) {
                case 'show-markdown':
                    this.$ui.openFileMarkdownModal(args[0]);
                    return;
                case 'route':
                    this.$router.push(args[0]);
                    return;
                case 'custom':
                    this.$emit('custom-trigger', args.join(':'));
                    return;
            }
        },
        getEventTrigger(element: HTMLElement | null): string | null {
            if (!element || element === this.$el)
                return null;

            const trigger = element instanceof HTMLAnchorElement
                ? element.href
                : element.dataset.trigger;

            return trigger || this.getEventTrigger(element.parentElement);
        },
    },
});
</script>

<style lang="scss">
    .markdown-content.markdown-content--typography {
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
            @apply text-xs text-blue-800;
        }

        pre {
            @apply whitespace-normal;

            code {
                @apply block p-2 mt-1 mb-4 rounded bg-gray-200 text-gray-700;
                word-break: break-all;
            }

        }

    }
</style>
