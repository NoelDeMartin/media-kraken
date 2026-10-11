<template>
    <div :class="renderedClass">
        <span v-if="title" class="mb-1 text-sm text-gray-600">{{ title }}</span>
        <slot />
    </div>
</template>

<script setup lang="ts">
import { classes } from '@aerogel/core';
import { computed, type HTMLAttributes } from 'vue';

const { class: className } = defineProps<{ title?: string; class?: HTMLAttributes['class'] }>();
const renderedClass = computed(() => classes('rounded-card flex flex-col bg-white p-6 shadow-sm', className));
</script>
