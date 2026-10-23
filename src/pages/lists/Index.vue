<template>
    <Page>
        <SectionTitle :level="1">
            {{ $t('lists.title') }} ({{ sortedLists.length }})
            <template #actions>
                <Button variant="secondary" @click="create()">
                    <i-mdi-plus class="size-4" />
                    {{ $t('lists.create.button') }}
                </Button>
            </template>
        </SectionTitle>
        <div v-if="loading" class="flex items-center justify-center py-16">
            <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
        </div>
        <p v-else-if="sortedLists.length === 0" class="mt-8 text-center text-gray-600">
            {{ $t('lists.empty') }}
        </p>
        <MediaGrid v-else class="mt-4" item-width="16rem">
            <ListCard v-for="list of sortedLists" :key="list.url" :list :media-by-url="mediaByUrl" />
        </MediaGrid>
    </Page>
</template>

<script setup lang="ts">
import { translate, UI } from '@aerogel/core';
import { Router } from '@aerogel/plugin-routing';
import { useModels } from '@aerogel/plugin-solid';
import { computed } from 'vue';

import { useListMedia } from '@/lib/composition/lists';
import { promptListName } from '@/lib/lists';
import { sortByLocale } from '@/lib/media';
import List from '@/models/List';

import ListCard, { LIST_PREVIEWS } from './components/ListCard.vue';

const { models: lists, loading } = useModels(List);
const { mediaByUrl } = useListMedia(() => lists.value.flatMap((list) => list.mediaUrls.slice(0, LIST_PREVIEWS)));
const sortedLists = computed(() => sortByLocale(lists.value, (list) => list.name));

async function create() {
    const name = await promptListName();

    if (!name) {
        return;
    }

    const list = await List.create({ name });

    UI.toast(translate('lists.created', { list: list.name }));

    await Router.push(list.route);
}
</script>
