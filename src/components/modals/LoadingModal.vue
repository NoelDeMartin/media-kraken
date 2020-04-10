<template>
    <AppModal :id="id" :options="options">
        <div class="flex items-center">
            <LoadingCircle class="w-8 h-8 text-primary-700 mr-4" />
            <MarkdownContent v-if="message" :content="message" />
        </div>
    </AppModal>
</template>

<script lang="ts">
import Modal from '@/components/mixins/Modal';

import LoadingCircle from '@/components/LoadingCircle.vue';
import MarkdownContent from '@/components/MarkdownContent.vue';

export default Modal.extend({
    components: {
        LoadingCircle,
        MarkdownContent,
    },
    props: {
        message: {
            type: String,
            default: 'Loading...',
        },
    },
});
</script>
