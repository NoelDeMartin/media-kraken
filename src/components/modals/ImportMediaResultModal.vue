<template>
    <Modal :title="$t('import.result.title')">
        <ul class="mt-2 flex flex-col gap-3">
            <li v-if="watchedCount > 0" class="flex flex-col">
                <div class="flex items-center gap-2 text-sm text-gray-800">
                    <i-material-symbols-check class="size-5 text-green-600" />
                    <Markdown :text="$t('import.result.watchedAdded', { count: watchedCount })" inline />
                </div>
                <button
                    type="button"
                    class="ml-7 cursor-pointer text-left text-xs text-blue-600 hover:underline"
                    @click="inspectWatched"
                >
                    {{ $t('import.result.viewDetails') }}
                </button>
            </li>
            <li v-if="pendingCount > 0" class="flex flex-col">
                <div class="flex items-center gap-2 text-sm text-gray-800">
                    <i-mdi-clock-outline class="size-5 text-blue-600" />
                    <Markdown :text="$t('import.result.pendingAdded', { count: pendingCount })" inline />
                </div>
                <button
                    type="button"
                    class="ml-7 cursor-pointer text-left text-xs text-blue-600 hover:underline"
                    @click="inspectPending"
                >
                    {{ $t('import.result.viewDetails') }}
                </button>
            </li>
            <li v-if="result.ignored.length > 0" class="flex flex-col">
                <div class="flex items-center gap-2 text-sm text-gray-800">
                    <i-mdi-information-outline class="size-5 text-blue-600" />
                    <span>
                        <strong>{{ result.ignored.length }}</strong> {{ $t('import.result.ignored') }}
                    </span>
                </div>
                <button
                    type="button"
                    class="ml-7 cursor-pointer text-left text-xs text-blue-600 hover:underline"
                    @click="inspectIgnored"
                >
                    {{ $t('import.result.viewDetails') }}
                </button>
            </li>
            <li v-if="result.unprocessed.length > 0" class="flex flex-col">
                <div class="flex items-center gap-2 text-sm text-gray-800">
                    <i-mdi-information-outline class="size-5 text-blue-600" />
                    <span>
                        <strong>{{ result.unprocessed.length }}</strong>
                        {{ $t('import.result.unprocessed') }}
                    </span>
                </div>
                <button
                    type="button"
                    class="ml-7 cursor-pointer text-left text-xs text-blue-600 hover:underline"
                    @click="inspectUnprocessed"
                >
                    {{ $t('import.result.viewDetails') }}
                </button>
            </li>
            <li v-if="result.invalid.length > 0" class="flex flex-col">
                <div class="flex items-center gap-2 text-sm text-gray-800">
                    <i-mdi-alert-circle-outline class="size-5 text-red-600" />
                    <span>
                        <strong>{{ result.invalid.length }}</strong> {{ $t('import.result.invalid') }}
                    </span>
                </div>
                <button
                    type="button"
                    class="ml-7 cursor-pointer text-left text-xs text-blue-600 hover:underline"
                    @click="inspectInvalid"
                >
                    {{ $t('import.result.viewDetails') }}
                </button>
            </li>
            <li v-if="result.failed.length > 0" class="flex flex-col">
                <div class="flex items-center gap-2 text-sm text-gray-800">
                    <i-mdi-alert-circle-outline class="size-5 text-red-600" />
                    <span>
                        <strong>{{ result.failed.length }}</strong> {{ $t('import.result.failed') }}
                    </span>
                </div>
                <button
                    type="button"
                    class="ml-7 cursor-pointer text-left text-xs text-blue-600 hover:underline"
                    @click="inspectFailed"
                >
                    {{ $t('import.result.viewDetails') }}
                </button>
            </li>
        </ul>
        <div class="mt-6 flex justify-end">
            <Button @click="close()">
                {{ $t('ui.ok') }}
            </Button>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { translate, UI, useModal } from '@aerogel/core';
import { computed } from 'vue';

import type { ImportMediaJobResult } from '@/jobs/ImportMedia';

const { result } = defineProps<{ result: ImportMediaJobResult }>();
const { close } = useModal();

const watchedCount = computed(() => result.added.filter((m) => m.watched).length);
const pendingCount = computed(() => result.added.filter((m) => !m.watched).length);

function inspectWatched() {
    const lines = result.added.filter((m) => m.watched).map((m, i) => `${i + 1}. ${m.title}`);

    UI.alert(translate('import.result.details.watchedTitle'), lines.join('\n'));
}

function inspectPending() {
    const lines = result.added.filter((m) => !m.watched).map((m, i) => `${i + 1}. ${m.title}`);

    UI.alert(translate('import.result.details.pendingTitle'), lines.join('\n'));
}

function inspectIgnored() {
    const lines: string[] = [];

    result.ignored.forEach(({ reason, data }, i) => {
        lines.push(`${i + 1}. ${reason}`);
        lines.push('```json\n' + JSON.stringify(data, null, 2) + '\n```');
    });

    UI.alert(translate('import.result.details.ignoredTitle'), lines.join('\n'));
}

function inspectUnprocessed() {
    const lines: string[] = [];

    result.unprocessed.forEach((data, i) => {
        lines.push(`${i + 1}. ${translate('import.result.details.unprocessedItem')}`);
        lines.push('```json\n' + JSON.stringify(data, null, 2) + '\n```');
    });

    UI.alert(translate('import.result.details.unprocessedTitle'), lines.join('\n'));
}

function inspectInvalid() {
    const lines: string[] = [];

    result.invalid.forEach(({ reason, data }, i) => {
        lines.push(`${i + 1}. ${reason}`);
        lines.push('```json\n' + JSON.stringify(data, null, 2) + '\n```');
    });

    UI.alert(translate('import.result.details.invalidTitle'), lines.join('\n'));
}

function inspectFailed() {
    const lines: string[] = [];

    result.failed.forEach(({ notFound, error, data }, i) => {
        if (notFound) {
            lines.push(`${i + 1}. ${error.message}`);
        } else {
            lines.push(`${i + 1}. ${translate('import.result.details.error', { message: error.message })}`);
        }
        lines.push('```json\n' + JSON.stringify(data, null, 2) + '\n```');
    });

    UI.alert(translate('import.result.details.failedTitle'), lines.join('\n'));
}
</script>
