<template>
    <div>
        <h1 class="text-2xl font-semibold mb-4 text-center">
            My Movies
        </h1>
        <MoviesGrid :movies="$media.movies" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Movie from '@/models/Movie';

import MoviesGrid from '@/components/MoviesGrid.vue';

export default Vue.extend({
    components: {
        MoviesGrid,
    },
});
</script>
