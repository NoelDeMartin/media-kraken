<template>
    <AppModal :id="id" :options="options" class="confirm-modal">
        <h2 v-if="title" class="font-semibold text-gray-800 leading-relaxed mb-3">
            {{ title }}
        </h2>
        <MarkdownContent v-if="markdown" :content="message" class="markdown-content--typography" />
        <p v-else class="text-center text-gray-700 mb-4">
            {{ message }}
        </p>
        <div class="flex flex-row self-end">
            <BaseButton
                class="text-primary-700 border border-primary-500 mr-2 hover:bg-black-overlay"
                @click="$ui.resolveModal(id, false)"
            >
                {{ cancelLabel }}
            </BaseButton>
            <BaseButton
                class="text-white bg-red-500 hover:bg-red-700"
                @click="$ui.resolveModal(id, true)"
            >
                {{ acceptLabel }}
            </BaseButton>
        </div>
    </AppModal>
</template>

<script lang="ts">
import MarkdownContent from '@/components/MarkdownContent.vue';
import Modal from '@/components/mixins/Modal';

export default Modal.extend({
    components: {
        MarkdownContent,
    },
    props: {
        title: {
            type: String,
            default: null,
        },
        message: {
            type: String,
            required: true,
        },
        markdown: {
            type: Boolean,
            default: false,
        },
        acceptLabel: {
            type: String,
            default: 'OK',
        },
        cancelLabel: {
            type: String,
            default: 'Cancel',
        },
    },
});
</script>

<style lang="scss">
    .confirm-modal {
        max-width: theme('maxWidth.md') !important;
    }
</style>
