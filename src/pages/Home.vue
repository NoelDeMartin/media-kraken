<template>
    <main>
        <h1 class="text-2xl font-semibold mb-4 text-center">
            My Movies
        </h1>
        <div class="overflow-y-auto">
            <MoviesGrid :movies="$media.movies" />
        </div>
    </main>
</template>

<script lang="ts">
import Vue from 'vue';

import MoviesGrid from '@/components/MoviesGrid.vue';

export default Vue.extend({
    components: {
        MoviesGrid,
    },
});
</script>
