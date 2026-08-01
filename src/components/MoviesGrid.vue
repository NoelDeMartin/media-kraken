<template>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MovieCard v-for="movie in movies" :key="movie.url" :movie class="aspect-2/3" />
    </div>
</template>

<script setup lang="ts">
import Movie from '@/models/Movie';

defineProps<{ movies: Movie[] }>();
</script>
