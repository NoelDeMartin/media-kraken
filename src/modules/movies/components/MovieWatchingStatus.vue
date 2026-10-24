<template>
    <span :class="['flex items-center gap-1', movie.watched ? 'text-green-700' : 'text-blue-700']">
        <i-material-symbols-check v-if="movie.watched" class="size-4" />
        <i-mdi-clock-outline v-else class="size-4" />
        {{ movie.watched ? $t('movies.watched') : $t('movies.pending') }}
    </span>
</template>

<script setup lang="ts">
import type Movie from '@movies/models/Movie';

defineProps<{ movie: Movie }>();
</script>
