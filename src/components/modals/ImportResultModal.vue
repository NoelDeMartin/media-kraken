<template>
    <Modal wrapper-class="sm:max-w-lg" class="p-6">
        <HeadlessModalTitle class="text-xl font-semibold text-gray-900">
            {{ $t('movies.importModals.result.title') }}
        </HeadlessModalTitle>
        <ul class="mt-4 flex flex-col gap-3">
            <li v-if="watchedCount > 0" class="flex flex-col">
                <div class="flex items-center gap-2 text-sm text-gray-800">
                    <i-material-symbols-check class="size-5 text-green-600" />
                    <span>
                        <strong>{{ watchedCount }}</strong> {{ $t('movies.importModals.result.watchedAdded') }}
                    </span>
                </div>
                <button
                    type="button"
                    class="ml-7 cursor-pointer text-left text-xs text-blue-600 hover:underline"
                    @click="inspectWatched"
                >
                    {{ $t('movies.importModals.result.viewDetails') }}
                </button>
            </li>
            <li v-if="pendingCount > 0" class="flex flex-col">
                <div class="flex items-center gap-2 text-sm text-gray-800">
                    <i-mdi-clock-outline class="size-5 text-blue-600" />
                    <span>
                        <strong>{{ pendingCount }}</strong> {{ $t('movies.importModals.result.pendingAdded') }}
                    </span>
                </div>
                <button
                    type="button"
                    class="ml-7 cursor-pointer text-left text-xs text-blue-600 hover:underline"
                    @click="inspectPending"
                >
                    {{ $t('movies.importModals.result.viewDetails') }}
                </button>
            </li>
            <li v-if="log.ignored.length > 0" class="flex flex-col">
                <div class="flex items-center gap-2 text-sm text-gray-800">
                    <i-mdi-information-outline class="size-5 text-blue-600" />
                    <span>
                        <strong>{{ log.ignored.length }}</strong> {{ $t('movies.importModals.result.ignored') }}
                    </span>
                </div>
                <button
                    type="button"
                    class="ml-7 cursor-pointer text-left text-xs text-blue-600 hover:underline"
                    @click="inspectIgnored"
                >
                    {{ $t('movies.importModals.result.viewDetails') }}
                </button>
            </li>
            <li v-if="log.unprocessed.length > 0" class="flex flex-col">
                <div class="flex items-center gap-2 text-sm text-gray-800">
                    <i-mdi-information-outline class="size-5 text-blue-600" />
                    <span>
                        <strong>{{ log.unprocessed.length }}</strong>
                        {{ $t('movies.importModals.result.unprocessed') }}
                    </span>
                </div>
                <button
                    type="button"
                    class="ml-7 cursor-pointer text-left text-xs text-blue-600 hover:underline"
                    @click="inspectUnprocessed"
                >
                    {{ $t('movies.importModals.result.viewDetails') }}
                </button>
            </li>
            <li v-if="log.invalid.length > 0" class="flex flex-col">
                <div class="flex items-center gap-2 text-sm text-gray-800">
                    <i-mdi-alert-circle-outline class="size-5 text-red-600" />
                    <span>
                        <strong>{{ log.invalid.length }}</strong> {{ $t('movies.importModals.result.invalid') }}
                    </span>
                </div>
                <button
                    type="button"
                    class="ml-7 cursor-pointer text-left text-xs text-blue-600 hover:underline"
                    @click="inspectInvalid"
                >
                    {{ $t('movies.importModals.result.viewDetails') }}
                </button>
            </li>
            <li v-if="log.failed.length > 0" class="flex flex-col">
                <div class="flex items-center gap-2 text-sm text-gray-800">
                    <i-mdi-alert-circle-outline class="size-5 text-red-600" />
                    <span>
                        <strong>{{ log.failed.length }}</strong> {{ $t('movies.importModals.result.failed') }}
                    </span>
                </div>
                <button
                    type="button"
                    class="ml-7 cursor-pointer text-left text-xs text-blue-600 hover:underline"
                    @click="inspectFailed"
                >
                    {{ $t('movies.importModals.result.viewDetails') }}
                </button>
            </li>
        </ul>
        <div class="mt-6 flex justify-end">
            <Button class="bg-blue-600 text-white hover:bg-blue-700" @click="close">
                {{ $t('movies.importModals.ok') }}
            </Button>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { UI, useModal } from '@aerogel/core';
import { computed } from 'vue';

import MarkdownModal from '@/components/modals/MarkdownModal.vue';
import type { ImportOperationLog } from '@/services/MovieImporter';

const { log } = defineProps<{ log: ImportOperationLog }>();
const { close } = useModal();

const watchedCount = computed(() => log.added.filter((m) => m.watched).length);
const pendingCount = computed(() => log.added.filter((m) => !m.watched).length);

function inspectWatched() {
    const lines = ['# Watched movies added:'];

    log.added.filter((m) => m.watched).forEach((m, i) => lines.push(`${i + 1}. ${m.title}`));
    UI.modal(MarkdownModal, { content: lines.join('\n') });
}

function inspectPending() {
    const lines = ['# Pending movies added:'];

    log.added.filter((m) => !m.watched).forEach((m, i) => lines.push(`${i + 1}. ${m.title}`));
    UI.modal(MarkdownModal, { content: lines.join('\n') });
}

function inspectIgnored() {
    const lines = ['# Ignored items:'];

    log.ignored.forEach(({ reason, data }, i) => {
        lines.push(`${i + 1}. ${reason}`);
        lines.push('```json\n' + JSON.stringify(data, null, 2) + '\n```');
    });
    UI.modal(MarkdownModal, { content: lines.join('\n') });
}

function inspectUnprocessed() {
    const lines = ['# Unprocessed items:'];

    log.unprocessed.forEach((data, i) => {
        lines.push(`${i + 1}. Item`);
        lines.push('```json\n' + JSON.stringify(data, null, 2) + '\n```');
    });
    UI.modal(MarkdownModal, { content: lines.join('\n') });
}

function inspectInvalid() {
    const lines = ['# Invalid items:'];

    log.invalid.forEach(({ reasons, data }, i) => {
        lines.push(`${i + 1}. ${reasons.join(', ')}`);
        lines.push('```json\n' + JSON.stringify(data, null, 2) + '\n```');
    });
    UI.modal(MarkdownModal, { content: lines.join('\n') });
}

function inspectFailed() {
    const lines = ['# Failed items:'];

    log.failed.forEach(({ notFound, error, data }, i) => {
        if (notFound) {
            lines.push(`${i + 1}. ${error.message}`);
        } else {
            lines.push(`${i + 1}. Error: ${error.message}`);
        }
        lines.push('```json\n' + JSON.stringify(data, null, 2) + '\n```');
    });
    UI.modal(MarkdownModal, { content: lines.join('\n') });
}
</script>
