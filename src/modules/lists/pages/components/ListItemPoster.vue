<template>
    <div
        v-if="missing"
        class="flex aspect-2/3 w-12 shrink-0 items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 text-gray-400 dark:border-white/20 dark:bg-white/5"
        aria-hidden="true"
    >
        <i-ph-link-break class="size-5" />
    </div>
    <MediaImage v-else :url class="relative aspect-2/3 w-12 shrink-0 rounded bg-gray-100 shadow-sm dark:bg-white/10" />
</template>

<script setup lang="ts">
import type { Nullable } from '@noeldemartin/utils';

defineProps<{ url?: Nullable<string>; missing?: boolean }>();
</script>
