<template>
    <article class="relative isolate border border-slate-200 bg-white shadow-sm">
        <MoviePoster :movie class="size-full" />
        <MovieCardBadge :movie class="absolute -top-3 -right-4 z-10" />
        <h2>
            <RouterLink
                :to="{
                    name: 'movies.show',
                    params: { movie: movie.slug },
                    query: $solid.hasLoggedIn() ? { url: movie.url } : undefined,
                }"
                :title="movie.title"
                class="group absolute inset-0"
            >
                <div class="absolute inset-0 hidden bg-black/20 group-focus-within:block group-hover:block" />
                <span class="sr-only">
                    {{ movie.title }} ({{ movie.watched ? $t('movies.watched') : $t('movies.pending') }})
                </span>
            </RouterLink>
        </h2>
    </article>
</template>

<script setup lang="ts">
import Movie from '@/models/Movie';

defineProps<{ movie: Movie }>();
</script>
