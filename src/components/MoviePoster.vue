<template>
    <img
        v-if="computedPosterUrl && !loadFailed"
        alt=""
        :src="computedPosterUrl"
        :class="renderedClasses"
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

import Movie from '@/models/Movie';

const {
    movie,
    posterUrl,
    class: className,
} = defineProps<{ movie?: Nullable<Movie>; posterUrl?: Nullable<string>; class?: HTMLAttributes['class'] }>();
const loadFailed = ref(false);
const computedPosterUrl = computed(() => movie?.posterUrl || posterUrl);
const renderedClasses = computed(() =>
    computedPosterUrl.value && !loadFailed.value
        ? classes('size-full object-cover', className)
        : classes('relative size-full bg-gray-300', className),
);

watch(computedPosterUrl, () => (loadFailed.value = false));
</script>
