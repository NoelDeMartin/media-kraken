<template>
    <article class="group/card relative isolate border border-slate-200 bg-white shadow-sm">
        <div class="size-full overflow-hidden">
            <MediaImage
                :url="movie.posterUrl"
                class="size-full transition-transform duration-300 group-has-[a:hover]/card:scale-110"
            />
        </div>
        <h2 class="peer">
            <RouterLink
                :to="{
                    name: 'movies.show',
                    params: { movie: movie.slug },
                    query: $solid.hasLoggedIn() ? { url: movie.url } : undefined,
                }"
                :title="movie.title"
                class="group/link absolute inset-0"
            >
                <div
                    class="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover/link:opacity-100"
                />
                <span class="sr-only">
                    {{ movie.title }} ({{ movie.watched ? $t('movies.watched') : $t('movies.pending') }})
                </span>
            </RouterLink>
        </h2>
        <MovieCardBadge
            :movie
            class="absolute -top-1 -right-3.5 z-10 transition-transform duration-300 hover:scale-125"
        />
    </article>
</template>

<script setup lang="ts">
import Movie from '@/models/Movie';

defineProps<{ movie: Movie }>();
</script>
