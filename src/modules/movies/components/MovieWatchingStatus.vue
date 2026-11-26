<template>
    <span
        :class="[
            'flex items-center gap-1',
            {
                'text-green-700 dark:text-green-400': movie.watchingStatus === 'watched',
                'text-blue-700 dark:text-blue-400': movie.watchingStatus === 'pending',
                'text-gray-700 dark:text-gray-300': movie.watchingStatus === 'dropped',
            },
        ]"
    >
        <i-material-symbols-check v-if="movie.watchingStatus === 'watched'" class="size-4" />
        <i-ph-archive-fill v-else-if="movie.watchingStatus === 'dropped'" class="size-4" />
        <i-mdi-clock-outline v-else class="size-4" />
        {{ $t(`movies.${movie.watchingStatus}`) }}
    </span>
</template>

<script setup lang="ts">
import type Movie from '@movies/models/Movie';

defineProps<{ movie: Movie }>();
</script>
