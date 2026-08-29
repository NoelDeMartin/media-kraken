<template>
    <Page>
        <h1 class="text-3xl font-semibold text-slate-900">{{ $t('shows.title') }} ({{ shows.length }})</h1>
        <MediaGrid class="mt-6">
            <ShowCard v-for="show of shows" :key="show.url" :show />
        </MediaGrid>
    </Page>
</template>

<script setup lang="ts">
import { useModelCollection } from '@aerogel/plugin-solid';

import Show from '@/models/Show';

const shows = useModelCollection(Show);
</script>
