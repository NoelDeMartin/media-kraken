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
import Modal from '@/components/mixins/Modal';

import Markdown from '@/utils/Markdown';

import LoadingCircle from '@/components/LoadingCircle.vue';

export default Modal.extend({
    components: {
        LoadingCircle,
    },
    props: {
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
