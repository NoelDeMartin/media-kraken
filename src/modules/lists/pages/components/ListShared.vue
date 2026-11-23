<template>
    <Page>
        <SectionTitle :level="1">{{ list.name }}</SectionTitle>
        <Markdown
            v-if="list.description"
            :text="list.description"
            class="mt-2 max-w-none wrap-break-word text-gray-700"
        />
        <ListSharedItems class="mt-4" :list :foreign />
        <ListFooter :list :fallback="foreign" />
    </Page>
</template>

<script setup lang="ts">
import type List from '@lists/models/List';

defineProps<{ list: List; foreign?: boolean }>();
</script>
