<template>
    <Page>
        <h1 class="text-3xl font-semibold text-slate-900">{{ $t('shows.title') }} ({{ shows.length }})</h1>
        <VirtualMediaGrid v-slot="{ item: show }" class="mt-6" by="url" :items="shows">
            <ShowCard :show />
        </VirtualMediaGrid>
    </Page>
</template>

<script setup lang="ts">
import { useModelCollection } from '@aerogel/plugin-solid';

import Show from '@/models/Show';

const shows = useModelCollection(Show);
</script>
