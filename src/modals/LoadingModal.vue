<template>
    <AppModal :id="id" :options="options">
        <div class="flex items-center">
            <LoadingCircle class="w-8 h-8 text-primary-700 mr-4" />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="messageHtml" />
        </div>
    </AppModal>
</template>

<script lang="ts">
import Vue from 'vue';

import { ModalOptions } from '@/services/UI';

import Markdown from '@/utils/Markdown';

import AppModal from '@/components/AppModal.vue';
import LoadingCircle from '@/components/LoadingCircle.vue';

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
        message: {
            type: String,
            default: 'Loading...',
        },
    },
    computed: {
        messageHtml(): string {
            return Markdown.render(this.message);
        },
    },
});
</script>
