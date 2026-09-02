<template>
    <Modal :title="$t('seedCollection.title')">
        <Markdown class="text-sm leading-relaxed text-gray-700" :text="$t('seedCollection.description')" />
        <Button variant="outline" class="mt-4 w-full" @click="seed()">
            {{ $t('seedCollection.submit') }}
        </Button>
    </Modal>
</template>

<script setup lang="ts">
import { translate, UI, useModal } from '@aerogel/core';
import { parseDate } from '@noeldemartin/utils';

import SeedCollection from '@/jobs/SeedCollection';

const { close } = useModal();

async function seed() {
    close();

    const { default: moviesJson } = await import('@/assets/data/imdb-top-100-rated-movies.json');
    const moviesAttributes = moviesJson.map((json) => ({
        ...json,
        releaseDate: parseDate(json.releaseDate) ?? undefined,
    }));

    await UI.runJob(new SeedCollection(moviesAttributes), { message: translate('seedCollection.seeding') });
}
</script>
