<template>
    <Modal :title="$t('lists.manage.title')" wrapper-class="sm:max-w-md">
        <div v-if="loading" class="py-8 text-center">
            <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
        </div>
        <Form v-else @submit="submit()">
            <p v-if="sortedLists.length === 0" class="py-6 text-center text-sm text-gray-500">
                {{ $t('lists.manage.empty') }}
            </p>
            <ul v-else>
                <li v-for="list of sortedLists" :key="list.url" class="flex items-center gap-3 py-2">
                    <Checkbox
                        :model-value="isSelected(list)"
                        :disabled="saving"
                        class="min-w-0 flex-1"
                        label-class="min-w-0 flex-1 font-medium [&>label]:block [&>label]:truncate"
                        @update:model-value="toggle(list)"
                    >
                        {{ list.name }}
                    </Checkbox>
                    <span class="shrink-0 text-right text-xs text-gray-500">
                        {{ $t('lists.itemsCount', { count: list.mediaUrls.length }) }}
                    </span>
                </li>
            </ul>
            <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
                <Button type="button" variant="ghost" class="-ml-2" :disabled="saving" @click="create()">
                    <i-mdi-plus class="size-4" />
                    {{ $t('lists.manage.new') }}
                </Button>
                <div class="flex items-center gap-2">
                    <Button type="button" variant="secondary" :disabled="saving" @click="close()">
                        {{ $t('ui.cancel') }}
                    </Button>
                    <Button submit :disabled="changes.size === 0" :loading="saving">
                        {{ $t('lists.manage.save') }}
                    </Button>
                </div>
            </div>
        </Form>
    </Modal>
</template>

<script setup lang="ts">
import { translate, UI, useModal } from '@aerogel/core';
import { useModels } from '@aerogel/plugin-solid';
import type { ModelWithUrl } from 'soukai-bis';
import { computed, reactive, ref } from 'vue';

import { sortByLocale, type Media } from '@/lib/media';
import ListFormModal from '@lists/components/modals/ListFormModal.vue';
import List from '@lists/models/List';

const { media } = defineProps<{ media: ModelWithUrl<Media> }>();
const { close } = useModal();
const { models: lists, loading } = useModels(List);
const sortedLists = computed(() => sortByLocale(lists.value, (list) => list.name));
const changes = reactive(new Map<string, boolean>());
const saving = ref(false);

function isSelected(list: ModelWithUrl<List>): boolean {
    return changes.get(list.url) ?? list.has(media);
}

function toggle(list: ModelWithUrl<List>) {
    const selected = !isSelected(list);

    if (selected === list.has(media)) {
        changes.delete(list.url);

        return;
    }

    changes.set(list.url, selected);
}

async function create() {
    const { list } = await UI.modal(ListFormModal);

    if (!list) {
        return;
    }

    changes.set(list.url, true);
}

async function submit() {
    saving.value = true;

    try {
        for (const list of lists.value) {
            const selected = changes.get(list.url);

            if (selected === undefined) {
                continue;
            }

            await (selected ? list.add(media) : list.remove(media));
        }
    } finally {
        saving.value = false;
    }

    UI.toast(translate('lists.manage.saved'));
    close();
}
</script>
