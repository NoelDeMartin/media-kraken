<template>
    <!-- eslint-disable vue/no-v-html -->
    <div v-if="html" @click="contentClicked" v-html="html" />
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

            if (!trigger)
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
