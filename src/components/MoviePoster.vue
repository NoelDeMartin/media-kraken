<template>
    <div class="relative border border-gray-300 overflow-hidden">
        <div class="relative ratio-2/3" />
        <div class="absolute inset-0 bg-gray-300">
            <BaseIcon
                name="photo"
                class="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-auto text-gray-500"
            />
            <div
                v-if="title"
                class="
                    absolute inset-0 flex items-end justify-center p-4
                    text-sm text-center font-medium leading-relaxed
                "
            >
                <span>{{ title }}</span>
            </div>
            <img v-if="url" :src="url" class="absolute inset-0 w-full h-full">
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        url: {
            type: String,
            default: null,
        },
        title: {
            type: String,
            default: null,
        },
    },
});
</script>
