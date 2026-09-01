<template>
    <Modal :title="$t('import.title')">
        <p class="text-sm leading-relaxed text-gray-700">
            {{ $t('import.description') }}
        </p>
        <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div v-for="source in sources" :key="source" class="relative aspect-square">
                <button
                    type="button"
                    class="flex size-full cursor-pointer flex-col items-center justify-center rounded-lg border border-slate-300 p-2 shadow-xs transition hover:bg-slate-100"
                    @click="importFrom(source)"
                >
                    <component :is="sourceIcons[source]" v-if="sourceIcons[source]" class="size-16" />
                    <span class="mt-2 font-semibold text-slate-700">{{ sourceTranslations[source]?.name }}</span>
                </button>
                <button
                    v-if="sourceTranslations[source] && 'helpTitle' in sourceTranslations[source]"
                    type="button"
                    class="absolute top-2 right-2 cursor-pointer text-blue-500 hover:text-blue-700"
                    :title="$t('import.helpForSource', { source: sourceTranslations[source].name })"
                    @click="showHelp(source)"
                >
                    <i-mdi-help-circle-outline class="size-5" />
                    <span class="sr-only">
                        {{ $t('import.helpForSource', { source: sourceTranslations[source].name }) }}
                    </span>
                </button>
            </div>
        </div>
        <input ref="fileInput" type="file" class="hidden" accept=".csv, text/csv" @change="handleFileUpload" />
    </Modal>
</template>

<script setup lang="ts">
import { translate, UI, useModal } from '@aerogel/core';
import { after, isTesting } from '@noeldemartin/utils';
import { ref, useTemplateRef, type Component } from 'vue';
import IconImdb from '~icons/app/imdb';
import IconCustom from '~icons/material-symbols-light/code-xml';
import IconNetflix from '~icons/selfhst/netflix';

import ImportMediaFromImdbModal from '@/components/modals/ImportMediaFromImdbModal.vue';
import ImportMediaHelpForCustomModal from '@/components/modals/ImportMediaHelpForCustomModal.vue';
import ImportMediaProgressModal from '@/components/modals/ImportMediaProgressModal.vue';
import CustomParser from '@/lib/parsers/CustomParser';
import type { ExternalMedia } from '@/lib/parsers/MediaParser';
import NetflixParser from '@/lib/parsers/NetflixParser';

type MediaSource = (typeof sources)[number];

const { close } = useModal();
const $fileInput = useTemplateRef('fileInput');
const currentSource = ref<MediaSource | null>(null);
const sources = ['imdb', 'netflix', 'custom'] as const;

const sourceIcons: Record<MediaSource, Component> = {
    imdb: IconImdb,
    netflix: IconNetflix,
    custom: IconCustom,
};

const sourceTranslations: Record<
    MediaSource,
    { name: string } | { name: string; helpTitle: string; helpBody: string }
> = {
    imdb: {
        name: translate('import.imdb.name'),
    },
    netflix: {
        name: translate('import.netflix.name'),
        helpTitle: translate('import.netflix.title'),
        helpBody: translate('import.netflix.description'),
    },
    custom: {
        name: translate('import.custom.name'),
        helpTitle: translate('import.custom.title'),
        helpBody: translate('import.custom.description'),
    },
};

function showHelp(source: MediaSource) {
    if (source === 'custom') {
        UI.modal(ImportMediaHelpForCustomModal);

        return;
    }

    if (!('helpTitle' in sourceTranslations[source])) {
        return;
    }

    UI.alert(sourceTranslations[source].helpTitle, sourceTranslations[source].helpBody);
}

async function importFrom(source: MediaSource) {
    if (source === 'imdb') {
        close();

        const { matches } = await UI.modal(ImportMediaFromImdbModal);

        if (!matches) {
            return;
        }

        if (matches.length === 0) {
            UI.toast(translate('import.imdb.noMatches'));

            return;
        }

        await launchJob(matches.map((match) => ({ imdbId: match.imdbId, raw: match.url })));

        return;
    }

    currentSource.value = source;

    if (isTesting('e2e')) {
        return;
    }

    await after(50);

    $fileInput.value?.click();
}

async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !currentSource.value) {
        return;
    }

    const source = currentSource.value;
    const data = await parseFileContents(file, source);

    if (!data) {
        return;
    }

    close();

    await launchJob(data);
}

async function parseFileContents(file: File, source: MediaSource): Promise<ExternalMedia[] | undefined> {
    const data = await parseRawFileContents(file);

    if (!data) {
        return;
    }

    switch (source) {
        case 'netflix':
            return NetflixParser.parse(data);
        case 'custom':
            return CustomParser.parse(data);
    }
}

async function parseRawFileContents(file: File): Promise<object[] | undefined> {
    try {
        const { parseCSV } = await import('@/lib/csv');

        return await parseCSV(file);
    } catch {
        UI.alert(translate('import.invalidFileTitle'), translate('import.invalidFileDescription'));
    }
}

async function launchJob(data: ExternalMedia[]) {
    if (data.length === 0) {
        return;
    }

    await UI.closeAllModals();
    await UI.modal(ImportMediaProgressModal, { data });
}
</script>
