<template>
    <div :class="renderedClass">
        <component :is="titleTag" v-if="title" :class="renderedTitleClasses">
            {{ title }}
        </component>

        <slot />
    </div>
</template>

<script setup lang="ts">
import { classes } from '@aerogel/core';
import { computed, type HTMLAttributes } from 'vue';

const {
    title,
    titleClass,
    titleLevel = 2,
    class: className,
} = defineProps<{
    title?: string;
    titleLevel?: number;
    titleClass?: HTMLAttributes['class'];
    class?: HTMLAttributes['class'];
}>();

const renderedClass = computed(() => classes('rounded-card flex flex-col bg-surface p-6 shadow-sm', className));
const titleTag = computed(() => `h${titleLevel}`);
const renderedTitleClasses = computed(() => classes('mb-1 text-sm text-gray-600 dark:text-gray-400', titleClass));
</script>
