<template>
    <Page :title="`${$t('shows.title')} (${shows.length})`">
        <div v-if="loading && shows.length === 0" class="flex items-center justify-center py-16">
            <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
        </div>
        <VirtualMediaGrid v-else v-slot="{ item: show }" class="mt-2" by="url" :items="shows" :animate="!loading">
            <ShowCard :show />
        </VirtualMediaGrid>
    </Page>
</template>

<script setup lang="ts">
import { useModels } from '@aerogel/plugin-solid';

import Show from '@/models/Show';

const { models: shows, loading } = useModels(Show);
</script>
