<template>
    <Modal wrapper-class="sm:max-w-xl" class="p-6">
        <HeadlessModalTitle class="text-xl font-semibold text-gray-900">
            {{ $t('movies.importModals.title') }}
        </HeadlessModalTitle>
        <p class="mt-2 text-sm leading-relaxed text-gray-700">
            {{ $t('movies.importModals.description') }}
        </p>
        <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div v-for="source in sources" :key="source" class="relative aspect-square">
                <button
                    type="button"
                    class="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-slate-300 p-4 shadow-xs transition hover:bg-slate-100"
                    :title="`Import from ${sourceNames[source]}`"
                    :aria-label="`Import from ${sourceNames[source]}`"
                    @click="importFrom(source)"
                >
                    <component :is="sourceIcons[source]" v-if="sourceIcons[source]" class="size-16" />
                    <img
                        v-else-if="source === 'goodfilms'"
                        src="@/assets/img/logos/goodfilms.png"
                        class="size-16 object-contain"
                        alt="Good Fil.ms"
                    />
                    <span class="mt-2 text-xs font-medium text-slate-700">{{ sourceNames[source] }}</span>
                </button>
                <button
                    v-if="sourceHelp[source]"
                    type="button"
                    class="absolute top-2 right-2 cursor-pointer text-blue-500 hover:text-blue-700"
                    :title="`Help for ${sourceNames[source]}`"
                    @click="openHelp(sourceHelp[source]!)"
                >
                    <i-mdi-help-circle-outline class="size-5" />
                </button>
            </div>
        </div>
        <input ref="fileInput" type="file" class="hidden" :accept="fileAccept" @change="handleFileUpload" />
    </Modal>
</template>

<script setup lang="ts">
import { UI, useModal } from '@aerogel/core';
import { ref } from 'vue';
import IconImdb from '~icons/app/imdb';
import IconJsonld from '~icons/app/jsonld';
import IconNetflix from '~icons/app/netflix';
import IconTviso from '~icons/app/tviso';

import importGoodfilmsHelp from '@/assets/markdown/import-goodfilms.md?raw';
import importJsonldHelp from '@/assets/markdown/import-jsonld.md?raw';
import importNetflixHelp from '@/assets/markdown/import-netflix.md?raw';
import importTvisoHelp from '@/assets/markdown/import-tviso.md?raw';
import ImportIMDbMoviesModal from '@/components/modals/ImportIMDbMoviesModal.vue';
import ImportProgressModal from '@/components/modals/ImportProgressModal.vue';
import ImportResultModal from '@/components/modals/ImportResultModal.vue';
import MarkdownModal from '@/components/modals/MarkdownModal.vue';
import CSV from '@/lib/CSV';
import MovieImporter, { MediaSource } from '@/services/MovieImporter';

const { close } = useModal();
const fileInput = ref<HTMLInputElement | null>(null);
const currentSource = ref<MediaSource | null>(null);
const fileAccept = ref('.json');

const sources = Object.values(MediaSource);

const sourceNames: Record<MediaSource, string> = {
    [MediaSource.IMDb]: 'IMDb',
    [MediaSource.Netflix]: 'Netflix',
    [MediaSource.JSONLD]: 'JSON-LD',
    [MediaSource.TViso]: 'TViso',
    [MediaSource.GoodFilms]: 'Good Fil.ms',
};

const sourceIcons: Partial<Record<MediaSource, any>> = {
    [MediaSource.IMDb]: IconImdb,
    [MediaSource.Netflix]: IconNetflix,
    [MediaSource.JSONLD]: IconJsonld,
    [MediaSource.TViso]: IconTviso,
};

const sourceHelp: Partial<Record<MediaSource, string>> = {
    [MediaSource.Netflix]: importNetflixHelp,
    [MediaSource.JSONLD]: importJsonldHelp,
    [MediaSource.TViso]: importTvisoHelp,
    [MediaSource.GoodFilms]: importGoodfilmsHelp,
};

function openHelp(markdown: string) {
    UI.modal(MarkdownModal, { content: markdown });
}

async function importFrom(source: MediaSource) {
    if (source === MediaSource.IMDb) {
        close();
        const data = await UI.modal(ImportIMDbMoviesModal);

        if (data && data.length > 0) {
            await startImport(data, source);
        }

        return;
    }

    currentSource.value = source;
    fileAccept.value = source === MediaSource.Netflix || source === MediaSource.GoodFilms ? '.csv' : '.json';

    setTimeout(() => {
        fileInput.value?.click();
    }, 50);
}

async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !currentSource.value) {
        return;
    }

    const text = await file.text();
    const source = currentSource.value;

    let data: object[] = [];

    try {
        if (source === MediaSource.Netflix || source === MediaSource.GoodFilms) {
            data = CSV.parse(text);
        } else {
            data = JSON.parse(text);
        }
    } catch {
        UI.alert('Import failed', "There was a problem importing that file, are you sure it's in the correct format?");

        return;
    }

    close();
    await startImport(data, source);
}

async function startImport(data: object[], source: MediaSource) {
    if (data.length === 0) {
        return;
    }

    const state = ref({
        current: 0,
        total: data.length,
        cancelled: false,
    });

    UI.modal(ImportProgressModal, {
        current: state.value.current,
        total: state.value.total,
        onCancel() {
            state.value.cancelled = true;
        },
    });

    const log = await MovieImporter.importMovies(
        data,
        source,
        (progress) => {
            state.value.current = progress.current;
        },
        () => state.value.cancelled,
    );

    UI.closeAllModals();
    UI.modal(ImportResultModal, { log });
}
</script>
