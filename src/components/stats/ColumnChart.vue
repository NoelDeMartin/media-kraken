<template>
    <div class="text-sm">
        <div class="flex h-40 items-end gap-0.5 border-b border-gray-300 pt-6">
            <div
                v-for="(entry, index) in entries"
                :key="entry.label"
                class="group flex h-full min-w-0 flex-1 items-end justify-center"
            >
                <div
                    class="bg-primary-500 group-hover:bg-primary-700 relative w-full max-w-6 rounded-t transition-colors"
                    :style="{ height: `${(entry.value / max) * 100}%` }"
                >
                    <span
                        v-if="index === maxIndex"
                        class="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-gray-600 tabular-nums group-hover:hidden"
                    >
                        {{ entry.value }}
                    </span>
                    <span
                        class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-gray-800 px-1.5 py-0.5 whitespace-nowrap text-white tabular-nums group-hover:block"
                    >
                        {{ entry.label }}: {{ entry.value }}
                    </span>
                </div>
                <span class="sr-only">{{ entry.label }}: {{ entry.value }}</span>
            </div>
        </div>
        <div class="mt-1 flex gap-0.5" aria-hidden="true">
            <span
                v-for="(entry, index) in entries"
                :key="entry.label"
                class="min-w-0 flex-1 text-center text-xs whitespace-nowrap text-gray-600"
            >
                {{ index % labelStep === 0 ? entry.label : '' }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const { entries } = defineProps<{ entries: { label: string; value: number }[] }>();
const max = computed(() => Math.max(1, ...entries.map(({ value }) => value)));
const maxIndex = computed(() => entries.findIndex(({ value }) => value === max.value));
const labelStep = computed(() => Math.ceil(entries.length / 10));
</script>
