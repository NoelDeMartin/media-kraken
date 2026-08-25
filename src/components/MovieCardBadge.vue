<template>
    <span v-if="movie.watched" class="pointer-events-none">
        <i-material-symbols-bookmark class="size-12 text-green-200" />
        <i-material-symbols-check
            class="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-green-600"
        />
    </span>
    <button v-else type="button" class="group cursor-pointer">
        <i-material-symbols-bookmark
            class="size-12 text-blue-200 group-focus-within:text-green-200 group-hover:text-green-200"
        />
        <i-mdi-clock-outline
            class="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-blue-600 group-focus-within:hidden group-hover:hidden"
        />
        <i-material-symbols-check
            class="absolute top-1/2 left-1/2 hidden size-5 -translate-x-1/2 -translate-y-1/2 text-green-600 group-focus-within:block group-hover:block"
        />
        <span class="sr-only">{{ $t('movies.watch') }}</span>
    </button>
</template>

<script setup lang="ts">
import Movie from '@/models/Movie';

defineProps<{ movie: Movie }>();
</script>
