<template>
    <article class="relative isolate aspect-4/3 overflow-hidden shadow-sm">
        <MediaImage :url="show.backdropUrl || show.posterUrl" class="size-full" />
        <span
            class="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-green-400 text-sm font-semibold text-white"
        >
            3
        </span>
        <div
            class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-white/50 px-3.5 py-2.5 backdrop-blur-md"
        >
            <div class="min-w-0">
                <h2 class="truncate font-bold text-gray-900">{{ show.name }}</h2>
                <p class="truncate text-sm text-gray-800">1x04 Please, Carol</p>
            </div>
            <i-material-symbols-check class="size-7 shrink-0 text-gray-900" />
        </div>
    </article>
</template>

<script setup lang="ts">
import type Show from '@/models/Show';

defineProps<{ show: Show }>();

// mode="episodes|collection"
</script>
