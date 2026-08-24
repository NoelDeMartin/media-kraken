<template>
    <Page>
        <article class="flex flex-row gap-6">
            <MoviePoster :movie class="aspect-2/3 w-64 shrink-0 rounded shadow" />
            <div class="flex flex-1 flex-col">
                <h1 class="text-2xl font-semibold text-gray-900">
                    {{ movie.title }}
                    <span v-if="movie.releaseYear" class="text-lg font-medium"> ({{ movie.releaseYear }}) </span>
                </h1>
                <div
                    class="flex items-center gap-1 text-sm lowercase"
                    :class="{
                        'text-green-700': movie.watched,
                        'text-blue-700': !movie.watched,
                    }"
                >
                    <i-material-symbols-check v-if="movie.watched" class="size-4" />
                    <i-mdi-clock-outline v-else class="size-4" />
                    <span>{{ movie.watched ? $t('movies.watched') : $t('movies.watchLater') }}</span>
                </div>
                <p v-if="movie.description" class="mt-2 leading-relaxed text-gray-700">
                    {{ movie.description }}
                </p>
            </div>
        </article>
    </Page>
</template>

<script setup lang="ts">
import Movie from '@/models/Movie';

defineProps<{ movie: Movie }>();
</script>
