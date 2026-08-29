<template>
    <span :class="renderedClass">
        <i-app-bookmark
            class="size-12"
            :class="{
                'text-green-200': show.watchingStatus === 'completed',
                'text-blue-200': show.watchingStatus === 'pending' || show.watchingStatus === 'watching',
                'text-gray-200': show.watchingStatus === 'dropped',
            }"
        />
        <ShowPendingEpisodesCount
            v-if="show.watchingStatus === 'watching'"
            :show
            aria-hidden="true"
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-blue-600"
        >
            <template #fallback-loading>
                <i-svg-spinners-180-ring class="size-5" />
            </template>
        </ShowPendingEpisodesCount>
        <i-mdi-clock-outline
            v-else-if="show.watchingStatus === 'pending'"
            class="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-blue-600"
        />
        <i-material-symbols-check
            v-else-if="show.watchingStatus === 'completed'"
            class="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-green-600"
        />
        <i-ph-archive-fill
            v-else-if="show.watchingStatus === 'dropped'"
            class="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-gray-600"
        />
    </span>
</template>

<script setup lang="ts">
import { classes } from '@aerogel/core';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';

import type Show from '@/models/Show';

const { class: className = '' } = defineProps<{ show: Show; class?: HTMLAttributes['class'] }>();
const renderedClass = computed(() => classes('relative drop-shadow-sm pointer-events-none', className));
</script>
