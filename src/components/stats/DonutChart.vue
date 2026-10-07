<template>
    <div class="flex flex-wrap items-center gap-6">
        <div class="relative size-40 shrink-0">
            <svg viewBox="0 0 42 42" class="size-full -rotate-90" aria-hidden="true">
                <circle cx="21" cy="21" :r="RADIUS" fill="none" class="stroke-gray-200" stroke-width="6" />
                <circle
                    v-for="(segment, index) in segments"
                    :key="segment.label"
                    cx="21"
                    cy="21"
                    :r="RADIUS"
                    fill="none"
                    :stroke="segment.color"
                    :stroke-width="hovered === index ? 7.5 : 6"
                    :stroke-dasharray="`${segment.length} ${100 - segment.length}`"
                    :stroke-dashoffset="-segment.offset"
                    class="transition-[stroke-width]"
                    @mouseenter="hovered = index"
                    @mouseleave="hovered = null"
                />
            </svg>
            <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-semibold text-gray-900 tabular-nums">
                    {{ hovered === null ? total : slices[hovered]?.value }}
                </span>
                <span class="text-xs text-gray-600">
                    {{ hovered === null ? totalLabel : slices[hovered]?.label }}
                </span>
            </div>
        </div>
        <ul class="flex flex-col gap-1.5 text-sm">
            <li
                v-for="(slice, index) in slices"
                :key="slice.label"
                class="flex items-center gap-2"
                :class="{ 'font-semibold': hovered === index }"
                @mouseenter="hovered = index"
                @mouseleave="hovered = null"
            >
                <span class="size-3 shrink-0 rounded-sm" :style="{ backgroundColor: slice.color }" />
                <span class="text-gray-700">{{ slice.label }}</span>
                <span class="text-gray-600 tabular-nums">
                    {{ slice.value }} ({{ total ? Math.round((slice.value / total) * 100) : 0 }}%)
                </span>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// Radius for a circumference of 100, so that dash lengths can be expressed as percentages.
const RADIUS = 100 / (2 * Math.PI);
const GAP = 0.5;

const { slices } = defineProps<{
    slices: { label: string; value: number; color: string }[];
    totalLabel: string;
}>();
const hovered = ref<number | null>(null);
const total = computed(() => slices.reduce((sum, { value }) => sum + value, 0));
const segments = computed(() => {
    const visibleSlices = slices.filter(({ value }) => value > 0).length;
    const gap = visibleSlices > 1 ? GAP : 0;
    let offset = 0;

    return slices.map(({ label, value, color }) => {
        const percentage = total.value ? (value / total.value) * 100 : 0;
        const segment = { label, color, offset: offset + gap / 2, length: Math.max(0, percentage - gap) };

        offset += percentage;

        return segment;
    });
});
</script>
