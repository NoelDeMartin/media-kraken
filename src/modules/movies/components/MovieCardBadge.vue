<template>
    <span v-if="movie.watchingStatus === 'watched'" :class="renderedSpanClass">
        <i-app-bookmark class="size-12 text-green-200" />
        <span
            v-if="movie.watchCount > 1"
            aria-hidden="true"
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-green-600"
        >
            ×{{ movie.watchCount }}
        </span>
        <i-material-symbols-check
            v-else
            class="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-green-600"
        />
    </span>
    <span v-else-if="movie.watchingStatus === 'dropped'" :class="renderedSpanClass">
        <i-app-bookmark class="size-12 text-gray-200" />
        <i-ph-archive-fill class="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-gray-600" />
    </span>
    <button
        v-else
        type="button"
        :class="renderedButtonClass"
        :disabled="loading"
        :title="$t('movies.watch')"
        @click="run(movie.updateWatchingStatus('watched'))"
    >
        <i-app-bookmark class="size-12 text-blue-200 group-focus-within:text-green-200 group-hover:text-green-200" />
        <i-mdi-clock-outline
            class="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-blue-600 group-focus-within:hidden group-hover:hidden"
        />
        <i-material-symbols-check
            class="absolute top-1/2 left-1/2 hidden size-6 -translate-x-1/2 -translate-y-1/2 text-green-600 group-focus-within:block group-hover:block"
        />
        <span class="sr-only">{{ $t('movies.watchMovie', { movie: movie.title }) }}</span>
    </button>
</template>

<script setup lang="ts">
import { classes, useLoading } from '@aerogel/core';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';

import type Movie from '@movies/models/Movie';

const { class: className = '' } = defineProps<{ movie: Movie; class?: HTMLAttributes['class'] }>();
const { loading, run } = useLoading({ min: 0 });
const renderedSpanClass = computed(() => classes('relative drop-shadow-sm pointer-events-none', className));
const renderedButtonClass = computed(() =>
    classes(
        'group relative drop-shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
        className,
    ),
);
</script>
