<template>
    <AppModal :id="id" :options="options">
        <h2 v-if="title" class="font-semibold text-center text-gray-800 mb-3">
            {{ title }}
        </h2>
        <p class="text-center text-gray-700 mb-4">
            {{ message }}
        </p>
        <BaseButton
            class="uppercase font-semibold text-primary-700 self-center hover:bg-black-overlay"
            @click="close"
        >
            Ok
        </BaseButton>
    </AppModal>
</template>

<script lang="ts">
import Modal from '@/components/mixins/Modal';

export default Modal.extend({
    props: {
        title: {
            type: String,
            default: null,
        },
        message: {
            type: String,
            required: true,
        },
    },
});
</script>
