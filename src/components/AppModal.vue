<template>
    <div
        class="
            flex relative rounded-lg max-w-content max-h-full p-4
            overflow-hidden overflow-y-auto shadow-xl bg-white
        "
    >
        <div v-if="cancelable" class="absolute right-0 top-0 p-2">
            <button class="p-2 rounded-lg hover:bg-gray-300" @click="$emit('close')">
                <BaseIcon name="close" class="w-4 h-4 text-gray-800" />
            </button>
        </div>
        <slot />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        cancelable: {
            type: Boolean,
            default: true,
        },
    },
});
</script>
