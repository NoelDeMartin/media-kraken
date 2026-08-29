<template>
    <span v-if="movie.watched" :class="renderedSpanClass">
        <i-app-bookmark class="size-12 text-green-200" />
        <i-material-symbols-check
            class="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-green-600"
        />
    </span>
    <button v-else type="button" :class="renderedButtonClass" @click="run(movie.watch())" :disabled="loading">
        <i-app-bookmark class="size-12 text-blue-200 group-focus-within:text-green-200 group-hover:text-green-200" />
        <i-mdi-clock-outline
            class="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-blue-600 group-focus-within:hidden group-hover:hidden"
        />
        <i-material-symbols-check
            class="absolute top-1/2 left-1/2 hidden size-6 -translate-x-1/2 -translate-y-1/2 text-green-600 group-focus-within:block group-hover:block"
        />
        <span class="sr-only">{{ $t('movies.watch') }}</span>
    </button>
</template>

<script setup lang="ts">
import { classes, useLoading } from '@aerogel/core';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';

import type Movie from '@/models/Movie';

const { class: className = '' } = defineProps<{ movie: Movie; class?: HTMLAttributes['class'] }>();
const { loading, run } = useLoading({ min: 0 });
const renderedSpanClass = computed(() => classes('relative drop-shadow-sm pointer-events-none', className));
const renderedButtonClass = computed(() =>
    classes(
        'group relative drop-shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        className,
    ),
);
</script>
