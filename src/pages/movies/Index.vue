<template>
    <Page :title="`${$t('movies.title')} (${movies.length})`">
        <VirtualMediaGrid v-slot="{ item: movie }" class="mt-2" by="url" :items="movies">
            <MovieCard :movie />
        </VirtualMediaGrid>
    </Page>
</template>

<script setup lang="ts">
import { useModelCollection } from '@aerogel/plugin-solid';

import Movie from '@/models/Movie';

const movies = useModelCollection(Movie);
</script>
