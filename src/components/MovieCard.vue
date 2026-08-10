<template>
    <article class="relative border border-slate-200 bg-white shadow-sm">
        <MoviePoster :movie class="size-full" />
        <MovieCardBadge :movie class="absolute -top-3 -right-4" />
        <h2>
            <a href="#" :title="movie.title">
                <span class="sr-only">{{ movie.title }}({{ movie.watched ? 'Watched' : 'Pending' }})</span>
                <span class="absolute inset-0" />
            </a>
        </h2>
    </article>
</template>

<script setup lang="ts">
import Movie from '@/models/Movie';

defineProps<{ movie: Movie }>();
</script>
