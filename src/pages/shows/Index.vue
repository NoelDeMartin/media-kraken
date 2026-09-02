<template>
    <Page :title="`${$t('shows.title')} (${shows.length})`">
        <VirtualMediaGrid v-slot="{ item: show }" class="mt-2" by="url" :items="shows">
            <ShowCard :show />
        </VirtualMediaGrid>
    </Page>
</template>

<script setup lang="ts">
import { useModelCollection } from '@aerogel/plugin-solid';

import Show from '@/models/Show';

const shows = useModelCollection(Show);
</script>
