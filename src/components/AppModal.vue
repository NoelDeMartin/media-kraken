<template>
    <div
        role="dialog"
        class="flex flex-col bg-white"
        :class="{
            'fixed inset-0': fullscreen,
            'relative rounded-lg shadow-xl max-w-content max-h-full overflow-hidden overflow-y-auto': !fullscreen,
        }"
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
                class="p-2 ml-2 -my-2 rounded-lg hover:bg-gray-300"
                @click="$ui.closeModal(id)"
            >
                <BaseIcon name="close" class="w-4 h-4 text-gray-800" />
            </button>
        </div>
        <div
            :id="`modal-${id}-body`"
            class="flex flex-col flex-grow px-4"
            :class="{
                'overflow-hidden': !scrollable,
                'pt-4': !title,
                'pb-4': !fullscreen,
                'pb-0': fullscreen,
                'overflow-y-scroll': fullscreen && scrollable,
            }"
        >
            <slot />
            <div v-if="fullscreen" class="flex-shrink-0 h-4" />
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
        fullscreen: {
            type: Boolean,
            default: false,
        },
        scrollable: {
            type: Boolean,
            default: true,
        },
    },
});
</script>
