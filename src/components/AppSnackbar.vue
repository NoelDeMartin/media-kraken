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
        <MarkdownContent :content="message" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { SnackbarOptions } from '@/services/UI';

import LoadingCircle from '@/components/LoadingCircle.vue';
import MarkdownContent from '@/components/MarkdownContent.vue';

const TRANSIENT_DURATION = 5000;

export default Vue.extend({
    components: {
        LoadingCircle,
        MarkdownContent,
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
    mounted() {
        if (!this.options.transient)
            return;

        setTimeout(() => this.$ui.hideSnackbar(this.id), TRANSIENT_DURATION);
    },
});
</script>
