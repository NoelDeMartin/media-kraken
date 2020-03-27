<template>
    <div
        class="
            flex items-center justify-center p-4 shadow-lg rounded-lg
            pointer-events-auto
        "
        :class="{
            'bg-gray-800 text-white': !options.error,
            'bg-red-600 text-red-100': options.error,
        }"
    >
        <LoadingCircle v-if="options.loading" class="mr-3 w-6 h-6" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="messageHtml" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { SnackbarOptions } from '@/services/UI';

import Markdown from '@/utils/Markdown';

import LoadingCircle from '@/components/LoadingCircle.vue';

const TRANSIENT_DURATION = 5000;

export default Vue.extend({
    components: {
        LoadingCircle,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        options: {
            type: Object as () => SnackbarOptions,
            required: true,
        },
    },
    computed: {
        messageHtml(): string {
            return Markdown.render(this.message);
        },
    },
    mounted() {
        if (!this.options.transient)
            return;

        setTimeout(() => this.$ui.hideSnackbar(this.id), TRANSIENT_DURATION);
    },
});
</script>
