<template>
    <component
        class="grid grid-cols-[repeat(auto-fill,minmax(var(--media-grid-item-width),1fr))] gap-6"
        :is="as"
        :style="{ '--media-grid-item-width': itemWidth }"
    >
        <slot />
    </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

const { as = 'div', itemWidth = '9rem' } = defineProps<{
    as?: string | Component;
    itemWidth?: string;
}>();
</script>
