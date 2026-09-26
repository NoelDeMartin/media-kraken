<template>
    <div v-if="emptyCollection" class="mt-8 text-center text-gray-600">
        {{ $t('movies.emptyCollection') }}
    </div>
    <div v-else class="mt-8 flex flex-col items-center gap-3 text-center text-gray-600">
        {{ $t('movies.noResults') }}

        <Button variant="secondary" @click="$emit('clearFilters')">
            {{ $t('movies.clearFilters') }}
        </Button>
    </div>
</template>

<script setup lang="ts">
import { Button } from '@aerogel/core';

defineEmits<{ clearFilters: [] }>();
defineProps<{ emptyCollection: boolean }>();
</script>
