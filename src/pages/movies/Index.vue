<template>
    <Page>
        <h1 class="text-3xl font-semibold text-slate-900">Movies ({{ movies.length }})</h1>
        <MoviesGrid :movies="movies" class="mt-6" />
    </Page>
</template>

<script setup lang="ts">
import { useModelCollection } from '@aerogel/plugin-solid';

import Movie from '@/models/Movie';

const movies = useModelCollection(Movie);
</script>
