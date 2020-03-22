<template>
    <main>
        <BasePageHeader>Collection ({{ $media.movies.length }})</BasePageHeader>
        <MoviesGrid :movies="$media.movies" />
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
