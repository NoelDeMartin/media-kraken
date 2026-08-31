<template>
    <Page>
        <h1 class="text-3xl font-semibold text-slate-900">{{ $t('movies.title') }} ({{ movies.length }})</h1>
        <VirtualMediaGrid v-slot="{ item: movie }" class="mt-6" by="url" :items="movies">
            <MovieCard :movie />
        </VirtualMediaGrid>
    </Page>
</template>

<script setup lang="ts">
import { useModelCollection } from '@aerogel/plugin-solid';

import Movie from '@/models/Movie';

const movies = useModelCollection(Movie);
</script>
