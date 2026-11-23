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
            <div v-if="model.description" class="relative flex-1">
                <p class="absolute inset-0 overflow-auto text-sm leading-relaxed text-gray-700">
                    {{ model.description }}
                </p>
            </div>
            <div v-else-if="loadingDetails" class="flex flex-1 items-center justify-center">
                <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-6 w-full" />
                <span class="sr-only">{{ $t('ui.loading') }}</span>
            </div>
            <ul :aria-label="$t('movies.externalSites')" class="ml-auto flex items-center gap-2">
                <li>
                    <ExternalSiteLink :url="tmdbShowUrl(tmdbId)" />
                </li>
                <li v-if="externalIds?.imdb_id">
                    <ExternalSiteLink :url="imdbUrl(externalIds.imdb_id)" />
                </li>
            </ul>
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
import { Errors, translate, UI, useModal } from '@aerogel/core';
import { isInstanceOf, required } from '@noeldemartin/utils';
import { computed, onMounted, ref, shallowRef } from 'vue';

import { imdbUrl } from '@/lib/imdb';
import { tmdbShowUrl } from '@/lib/tmdb';
import Catalog from '@/services/Catalog';
import type { TMDBShow, TMDBShowExternalIds, TMDBShowWithStaff } from '@/services/TMDB';
import TMDB from '@/services/TMDB';
import Show from '@shows/models/Show';
import { SHOW_WATCHING_STATUSES, type ShowWatchingStatus } from '@shows/models/ShowWatching';

const { show } = defineProps<{ show: TMDBShow | Show }>();
const { close } = useModal();
const tmdbId = isInstanceOf(show, Show) ? required(show.tmdbId) : show.id;
const details = shallowRef<TMDBShowWithStaff | null>(null);
const detailsFailed = ref(false);
const loadingDetails = computed(() => !details.value && !detailsFailed.value && isInstanceOf(show, Show));
const model = computed(() => {
    const tmdbShow = details.value ?? (isInstanceOf(show, Show) ? null : show);

    return tmdbShow ? Show.fromTMDB(tmdbShow, { posterSize: 'large' }) : (show as Show);
});
const statusOptions = Object.keys(SHOW_WATCHING_STATUSES) as ShowWatchingStatus[];
const status = ref<ShowWatchingStatus>('pending');
const externalIds = shallowRef<TMDBShowExternalIds | null>(null);

function renderStatus(option: ShowWatchingStatus): string {
    return translate(`shows.statuses.${option}`);
}

async function saveToCollection() {
    close();

    await Catalog.importShowFromTMDB(tmdbId, { watchingStatus: status.value });

    UI.toast(translate('shows.added', { show: model.value.name }));
}

async function loadDetails(): Promise<void> {
    if (!isInstanceOf(show, Show)) {
        externalIds.value = await TMDB.getShowExternalIds(tmdbId);

        return;
    }

    const result = await TMDB.getShow(tmdbId, { includeSeasons: false, includeCredits: false, includeKeywords: false });

    details.value = result.details;
    externalIds.value = result.externalIds;
}

onMounted(async () => {
    try {
        await loadDetails();
    } catch (error) {
        detailsFailed.value = true;

        await Errors.report(error);
    }
});
</script>
