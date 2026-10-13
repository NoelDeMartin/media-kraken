<template>
    <component :is="tag" :class="renderedClasses">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { classes } from '@aerogel/core';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';

const { level = 2, class: rootClasses } = defineProps<{
    level?: number;
    class?: HTMLAttributes['class'];
}>();

const tag = computed(() => `h${level}`);

const renderedClasses = computed(() =>
    classes(
        'flex items-center gap-1 text-gray-900',
        level === 2 ? 'text-xl font-semibold' : 'text-lg font-medium',
        rootClasses,
    ),
);
</script>
