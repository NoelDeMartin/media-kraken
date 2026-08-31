<template>
    <img
        v-if="url && !loadFailed"
        alt=""
        :src="url"
        :class="renderedClasses"
        loading="lazy"
        decoding="async"
        @error="loadFailed = true"
    />
    <div v-else :class="renderedClasses">
        <i-mdi-image-remove
            v-if="loadFailed"
            class="absolute top-1/2 left-1/2 block h-full w-[30%] max-w-20 -translate-x-1/2 -translate-y-1/2 text-gray-500"
        />
        <i-mdi-image
            v-else
            class="absolute top-1/2 left-1/2 block h-full w-[30%] max-w-20 -translate-x-1/2 -translate-y-1/2 text-gray-500"
        />
    </div>
</template>

<script setup lang="ts">
import { classes } from '@aerogel/core';
import type { Nullable } from '@noeldemartin/utils';
import { computed, ref, watch, type HTMLAttributes } from 'vue';

const { url, class: className } = defineProps<{
    url?: Nullable<string>;
    class?: HTMLAttributes['class'];
}>();
const loadFailed = ref(false);
const renderedClasses = computed(() =>
    url && !loadFailed.value
        ? classes('size-full object-cover', className)
        : classes('relative size-full bg-gray-300', className),
);

watch(
    () => url,
    () => (loadFailed.value = false),
);
</script>
