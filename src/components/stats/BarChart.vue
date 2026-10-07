<template>
    <ol class="flex flex-col gap-1.5 text-sm">
        <li
            v-for="entry in entries"
            :key="entry.label"
            class="group grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3"
            :title="`${entry.label}: ${entry.value}`"
        >
            <span class="truncate text-gray-700">{{ entry.label }}</span>
            <div class="flex items-center gap-2">
                <div
                    class="bg-primary-500 group-hover:bg-primary-700 h-4 min-w-0.5 rounded-r transition-colors"
                    :style="{ width: `calc(${entry.value / max} * (100% - 3rem))` }"
                />
                <span class="text-gray-600 tabular-nums">{{ entry.value }}</span>
            </div>
        </li>
    </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const { entries } = defineProps<{ entries: { label: string; value: number }[] }>();
const max = computed(() => Math.max(1, ...entries.map(({ value }) => value)));
</script>
