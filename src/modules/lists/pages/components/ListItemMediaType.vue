<template>
    <p class="mt-1 flex items-center gap-1 text-xs text-gray-500">
        <i-ph-film-slate v-if="movie" class="size-4 shrink-0" />
        <i-ph-television-simple v-else class="size-4 shrink-0" />
        <span>
            {{ movie ? $t('lists.movie') : $t('lists.show') }}
            <template v-if="releaseYear"> · {{ releaseYear }}</template>
        </span>
    </p>
</template>

<script setup lang="ts">
import type { Nullable } from '@noeldemartin/utils';

defineProps<{ movie?: boolean; releaseYear?: Nullable<number> }>();
</script>
