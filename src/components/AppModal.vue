<template>
    <div
        role="dialog"
        class="
            flex flex-col relative rounded-lg max-w-content max-h-full
            overflow-hidden overflow-y-auto shadow-xl bg-white
        "
        :aria-labelledby="title && `modal-${id}-title`"
        :aria-describedby="`modal-${id}-body`"
    >
        <div v-if="title" class="flex p-4 items-center">
            <h2 :id="`modal-${id}-title`" class="font-semibold text-xl">
                {{ title }}
            </h2>
            <div class="flex-grow" />
            <button
                v-if="options.cancellable"
                type="button"
                class="p-2 -my-2 rounded-lg hover:bg-gray-300"
                @click="$ui.closeModal(id)"
            >
                <BaseIcon name="close" class="w-4 h-4 text-gray-800" />
            </button>
        </div>
        <div :id="`modal-${id}-body`" class="px-4 pb-4" :class="{ 'pt-4': !title }">
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { ModalOptions } from '@/services/UI';

export default Vue.extend({
    props: {
        id: {
            type: String,
            required: true,
        },
        options: {
            type: Object as () => ModalOptions,
            required: true,
        },
        title: {
            type: String,
            default: null,
        },
    },
});
</script>
