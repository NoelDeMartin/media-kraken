<template>
    <component :class="renderedClasses" :is="as" :style="{ '--media-grid-item-width': itemWidth }">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { classes } from '@aerogel/core';
import { computed, type Component, type HTMLAttributes } from 'vue';

const {
    as = 'div',
    class: rootClass = '',
    itemWidth = '9rem',
} = defineProps<{
    as?: string | Component;
    class?: HTMLAttributes['class'];
    itemWidth?: string;
}>();

const renderedClasses = computed(() =>
    classes('grid grid-cols-[repeat(auto-fill,minmax(var(--media-grid-item-width),1fr))] gap-6', rootClass),
);
</script>
