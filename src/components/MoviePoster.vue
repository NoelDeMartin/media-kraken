<template>
    <img
        v-if="movie.posterUrl && !loadFailed"
        :src="movie.posterUrl"
        alt=""
        class="size-full object-cover"
        @error="loadFailed = true"
    />
    <div v-else class="relative size-full bg-gray-300">
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
import { ref } from 'vue';

import Movie from '@/models/Movie';

defineProps<{ movie: Movie }>();

const loadFailed = ref(false);
</script>
