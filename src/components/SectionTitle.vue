<template>
    <div v-if="menu || $slots.actions" :class="classes('flex items-center', rootClasses)">
        <i-mdi-sync v-if="loading" class="mr-1 size-5 animate-spin" />
        <DropdownMenu v-else-if="menu" align="start" :options="menu">
            <Button size="icon" variant="ghost" :title="$t('ui.openActionsMenu')" class="-ml-3 rounded-md p-1">
                <i-mdi-dots-vertical class="size-5" />
                <span class="sr-only">{{ $t('ui.openActionsMenu') }}</span>
            </Button>
        </DropdownMenu>
        <component :is="tag" :class="headingClasses">
            <slot />
        </component>
        <div class="flex-1" />
        <slot name="actions" />
    </div>
    <component :is="tag" v-else :class="classes(headingClasses, rootClasses)">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { classes } from '@aerogel/core';
import type { DropdownMenuOptionData, Falsifiable } from '@aerogel/core';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';

const {
    level = 2,
    menu,
    class: rootClasses,
} = defineProps<{
    level?: number;
    menu?: readonly Falsifiable<DropdownMenuOptionData>[];
    loading?: boolean;
    class?: HTMLAttributes['class'];
}>();

const tag = computed(() => `h${level}`);

const headingClasses = computed(() =>
    classes(
        'flex items-center gap-1 text-gray-900',
        {
            1: 'text-xl font-medium',
            2: 'text-xl font-semibold',
        }[level] ?? 'text-lg font-medium',
    ),
);
</script>
