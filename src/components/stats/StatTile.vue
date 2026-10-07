<template>
    <div class="rounded-card flex flex-col bg-white p-4 shadow-sm">
        <span class="text-sm text-gray-600">{{ label }}</span>
        <span class="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">{{ value }}</span>
        <span v-if="$slots.default" class="mt-1 truncate text-sm text-gray-600"><slot /></span>
    </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string | number }>();
</script>
