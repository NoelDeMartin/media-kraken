<template>
    <div class="min-w-0 flex-1">
        <p class="truncate text-sm text-gray-500 italic dark:text-gray-400">
            {{ $t('lists.missingMedia') }}
        </p>
        <p v-if="mediaUrl" class="mt-0.5 truncate text-xs text-gray-400" :title="mediaUrl">
            {{ mediaUrl }}
        </p>
    </div>
</template>

<script setup lang="ts">
defineProps<{ mediaUrl?: string }>();
</script>
