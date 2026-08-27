<template>
    <Modal wrapper-class="sm:max-w-2xl" class="flex flex-row p-0">
        <MediaImage
            :url="model.posterUrl"
            class="m-1 aspect-2/3 w-56 rounded-[calc(var(--radius-lg)-(--spacing(1)))]"
        />
        <div class="flex flex-1 flex-col gap-3 p-4">
            <HeadlessModalTitle class="pr-8 text-xl font-semibold text-gray-900">
                {{ model.name }}
                <span v-if="model.releaseYear" class="text-base font-medium"> ({{ model.releaseYear }}) </span>
            </HeadlessModalTitle>
            <p v-if="model.description" class="text-sm leading-relaxed text-gray-700">
                {{ model.description }}
            </p>
            <div class="mt-auto flex items-end justify-end gap-2">
                <Select
                    v-model="status"
                    :label="$t('shows.status')"
                    label-class="sr-only"
                    :options="statusOptions"
                    :render-option="renderStatus"
                    class="min-w-40"
                />
                <Button @click="saveToCollection()">
                    {{ $t('shows.add') }}
                </Button>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { translate, UI, useModal } from '@aerogel/core';
import { computed, ref } from 'vue';

import Show from '@/models/Show';
import { SHOW_WATCHING_STATUSES, type ShowWatchingStatus } from '@/models/ShowWatching';
import type { TMDBShow } from '@/services/TMDB';

const { show } = defineProps<{ show: TMDBShow }>();
const { close } = useModal();
const model = computed(() => Show.fromTMDB(show, { posterSize: 'large' }));
const statusOptions = Object.keys(SHOW_WATCHING_STATUSES) as ShowWatchingStatus[];
const status = ref<ShowWatchingStatus>('pending');

function renderStatus(option: ShowWatchingStatus): string {
    return translate(`shows.statuses.${option}`);
}

async function saveToCollection() {
    close();

    if (status.value !== 'pending') {
        model.value.mintUrl();

        await model.value.updateWatchingStatus(status.value);
    }

    await model.value.save();

    UI.toast(translate('shows.added', { show: model.value.name }));
}
</script>
