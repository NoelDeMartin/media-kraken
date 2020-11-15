<template>
    <div
        class="flex items-center justify-center shadow-lg rounded-lg overflow-hidden pointer-events-auto"
        :class="{
            'bg-gray-800 text-white': !options.error,
            'bg-red-200 text-red-700 font-medium': options.error,
        }"
    >
        <div
            class="flex items-center justify-center p-4 rounded-l-lg"
            :class="{ 'border border-r-0 border-red-300': options.error }"
        >
            <LoadingCircle v-if="options.loading" class="mr-3 w-6 h-6" />
            <MarkdownContent :content="message" />
        </div>
        <button
            v-if="options.action"
            type="button"
            class="relative flex p-4 font-bold uppercase text-sm group self-stretch items-center"
            :class="{ 'bg-red-500 text-white': options.error }"
            @click="clickAction"
        >
            <div class="absolute inset-0 opacity-15 bg-black group-hover:opacity-30" />
            <span class="z-10">{{ options.action.text }}</span>
        </button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { SnackbarOptions } from '@/services/UI';

import LoadingCircle from '@/components/LoadingCircle.vue';
import MarkdownContent from '@/components/MarkdownContent.vue';

const DEFAULT_LIFETIME = 5000;

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

        setTimeout(() => this.$ui.hideSnackbar(this.id), this.options.lifetime || DEFAULT_LIFETIME);
    },
    methods: {
        clickAction() {
            if (!this.options.action?.handler)
                return;

            this.options.action.handler();
        },
    },
});
</script>
