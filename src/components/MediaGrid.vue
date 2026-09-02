<template>
    <div
        class="grid grid-cols-[repeat(auto-fill,minmax(var(--media-grid-item-width),1fr))] gap-6"
        :style="{ '--media-grid-item-width': itemWidth }"
    >
        <slot />
    </div>
</template>

<script setup lang="ts">
const { itemWidth = '9rem' } = defineProps<{
    itemWidth?: string;
}>();
</script>
