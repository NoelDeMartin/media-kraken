<template>
    <span
        :class="[
            'flex items-center gap-1',
            {
                'text-green-700 dark:text-green-400': status === 'completed',
                'text-blue-700 dark:text-blue-400': status === 'pending' || status === 'watching',
                'text-gray-700 dark:text-gray-300': status === 'dropped',
            },
        ]"
    >
        <i-material-symbols-check v-if="status === 'completed'" class="size-4" />
        <i-mdi-play-circle-outline v-else-if="status === 'watching'" class="size-4" />
        <i-mdi-clock-outline v-else-if="status === 'pending'" class="size-4" />
        <i-ph-archive-fill v-else class="size-4" />
        {{ $t(`shows.statuses.${status}`) }}
        <slot />
    </span>
</template>

<script setup lang="ts">
import type { ShowWatchingStatus } from '@shows/models/ShowWatching';

defineProps<{ status: ShowWatchingStatus }>();
</script>
