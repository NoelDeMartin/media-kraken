<template>
    <article class="relative isolate border border-slate-200 bg-white shadow-sm">
        <MediaImage :url="movie.posterUrl" class="size-full" />
        <h2 class="peer">
            <RouterLink
                :to="{
                    name: 'movies.show',
                    params: { movie: movie.slug },
                    query: $solid.hasLoggedIn() ? { url: movie.url } : undefined,
                }"
                :title="movie.title"
                class="group focus:ring-primary-500 focus-visible:ring-offset-background absolute inset-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                <div
                    class="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <span class="sr-only">
                    {{ movie.title }} ({{ movie.watched ? $t('movies.watched') : $t('movies.pending') }})
                </span>
            </RouterLink>
        </h2>
        <MovieCardBadge :movie class="absolute -top-1 -right-3.5 z-10" />
    </article>
</template>

<script setup lang="ts">
import Movie from '@/models/Movie';

defineProps<{ movie: Movie }>();
</script>
