<template>
    <RadioGroupRoot v-model="model" orientation="horizontal" :class="renderedClasses">
        <RadioGroupItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="focus-visible:outline-primary-500 hover:text-primary-text data-[state=checked]:bg-surface data-[state=checked]:text-primary-text cursor-pointer rounded-sm px-3 py-1 text-sm font-medium text-gray-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 data-[state=checked]:shadow-sm dark:text-gray-400"
        >
            {{ option.label }}
        </RadioGroupItem>
    </RadioGroupRoot>
</template>

<script setup lang="ts" generic="T extends string">
import { classes } from '@aerogel/core';
import { RadioGroupItem, RadioGroupRoot } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';

export interface RadioTabsOption<T> {
    value: T;
    label: string;
}

const { options, class: rootClasses } = defineProps<{
    options: RadioTabsOption<T>[];
    class?: HTMLAttributes['class'];
}>();

const model = defineModel<T>({ required: true });
const renderedClasses = computed(() =>
    classes('flex items-center gap-1 rounded-md bg-gray-200 dark:bg-white/10 p-1', rootClasses),
);
</script>
