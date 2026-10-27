<template>
    <Page>
        <SectionTitle :level="1" :loading="updating" :menu="menuOptions">
            {{ list.name }} ({{ list.mediaUrls.length }})
            <template #actions>
                <Button
                    variant="secondary"
                    :title="$t('lists.addItems.action')"
                    :disabled="updating"
                    @click="addItems()"
                >
                    <i-mdi-plus class="size-4" />
                    <span class="sr-only sm:not-sr-only">{{ $t('lists.addItems.action') }}</span>
                </Button>
            </template>
        </SectionTitle>
        <Markdown
            v-if="list.description"
            :text="list.description"
            class="mt-2 max-w-none wrap-break-word text-gray-700"
        />
        <ListItems
            class="mt-4"
            :list
            :disabled="updating"
            @move="(item, target) => runUpdate(list.move(item, target))"
            @remove="(item) => runUpdate(list.removeItem(item))"
        />
    </Page>
</template>

<script setup lang="ts">
import { translate, UI, useLoading } from '@aerogel/core';
import { Router } from '@aerogel/plugin-routing';
import { computed } from 'vue';
import IconEdit from '~icons/mdi/pencil';
import IconDelete from '~icons/ph/trash';

import AddListItemsModal from '@lists/components/modals/AddListItemsModal.vue';
import ListFormModal from '@lists/components/modals/ListFormModal.vue';
import type List from '@lists/models/List';
import ListItems from '@lists/pages/components/ListItems.vue';

const { list } = defineProps<{ list: List }>();
const { loading: updating, run: runUpdate } = useLoading();
const menuOptions = computed(() => [
    {
        label: translate('lists.edit.action'),
        icon: IconEdit,
        click: edit,
    },
    {
        label: translate('lists.delete.action'),
        icon: IconDelete,
        click: deleteList,
    },
]);

async function addItems() {
    await UI.modal(AddListItemsModal, { list });
}

async function edit() {
    await UI.modal(ListFormModal, { list });
}

async function deleteList() {
    if (
        !(await UI.confirm(translate('lists.delete.title'), translate('lists.delete.message'), {
            acceptVariant: 'danger',
            acceptText: translate('lists.delete.accept'),
        }))
    ) {
        return;
    }

    await runUpdate(list.deleteWithItems());
    await Router.push('/lists');

    UI.toast(translate('lists.delete.success', { list: list.name }));
}
</script>
