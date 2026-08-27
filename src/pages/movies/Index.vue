<template>
    <Page>
        <h1 class="text-3xl font-semibold text-slate-900">Movies ({{ movies.length }})</h1>
        <MediaGrid class="mt-6">
            <MovieCard v-for="movie in movies" :key="movie.url" :movie class="aspect-2/3" />
        </MediaGrid>
    </Page>
</template>

<script setup lang="ts">
import { useModelCollection } from '@aerogel/plugin-solid';

import Movie from '@/models/Movie';

const movies = useModelCollection(Movie);
</script>
