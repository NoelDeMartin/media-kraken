<template>
    <a v-if="href" :href :target :rel :tabindex>
        <slot />
    </a>
    <span v-else>
        <slot />
    </span>
</template>

<script setup lang="ts">
import type { Nullable } from '@noeldemartin/utils';
import type { HTMLAttributes } from 'vue';

defineProps<{
    href?: Nullable<string>;
    target?: string;
    rel?: string;
    tabindex?: HTMLAttributes['tabindex'];
}>();
</script>
