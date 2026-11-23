<template>
    <Page>
        <SectionTitle :level="1" :loading>{{ list.name }}</SectionTitle>
        <Markdown
            v-if="list.description"
            :text="list.description"
            class="mt-2 max-w-none wrap-break-word text-gray-700"
        />
        <ListForeignItems class="mt-4" :items :loading />
        <ListFooter :list fallback />
    </Page>
</template>

<script setup lang="ts">
import { useResolvedListItems } from '@lists/lib/composition/items';
import type List from '@lists/models/List';

const { list } = defineProps<{ list: List }>();
const { items, loading } = useResolvedListItems(() => list, { foreign: true });
</script>
