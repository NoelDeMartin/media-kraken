<template>
    <p v-if="items.length === 0" class="mt-8 text-center text-gray-600 dark:text-gray-400">
        {{ $t('lists.emptyReadonlyList') }}
    </p>
    <ol v-else class="-mx-4 [counter-reset:list-items] sm:-mx-5">
        <li
            v-for="item of displayItems"
            :key="item.model.url"
            class="before:text-primary-600 flex items-center gap-3 px-2 py-2 [counter-increment:list-items] before:-ml-2 before:w-7 before:shrink-0 before:text-right before:text-lg before:font-semibold before:tabular-nums before:content-[counter(list-items)'.'/''] sm:gap-4 sm:px-3"
        >
            <ListItemPoster
                :url="item.resolvedMedia?.posterUrl ?? item.media?.posterUrl"
                :missing="!item.resolvedMedia && !item.media"
            />
            <div v-if="item.resolvedMedia || item.media" class="min-w-0 flex-1">
                <Link
                    v-if="item.resolvedMedia"
                    class="text-normal inline-block min-h-0 max-w-full truncate align-top leading-5 font-medium"
                    :to="item.resolvedMedia.route"
                >
                    {{ mediaDisplayName(item.resolvedMedia) }}
                </Link>
                <Link
                    v-else-if="!loading && tmdbId(item)"
                    class="text-normal inline-block min-h-0 max-w-full truncate align-top leading-5 font-medium"
                    @click="viewDetails(item)"
                >
                    {{ mediaDisplayName(item.media!) }}
                </Link>
                <span
                    v-else-if="item.media"
                    class="text-normal inline-block min-h-0 max-w-full truncate align-top leading-5 font-medium"
                >
                    {{ mediaDisplayName(item.media) }}
                </span>
                <ListItemMediaType
                    :movie="isInstanceOf(item.resolvedMedia ?? item.media, Movie)"
                    :release-year="item.resolvedMedia?.releaseYear ?? item.media?.releaseYear"
                />
                <MovieWatchingStatus
                    v-if="isInstanceOf(item.resolvedMedia, Movie)"
                    :movie="item.resolvedMedia"
                    class="mt-1 text-xs sm:hidden"
                />
                <ShowWatchingStatus
                    v-else-if="isInstanceOf(item.resolvedMedia, Show)"
                    :status="item.resolvedMedia.watchingStatus"
                    class="mt-1 text-xs sm:hidden"
                />
                <span v-else-if="!loading" class="mt-1 block text-xs text-gray-500 sm:hidden dark:text-gray-400">
                    {{ $t('lists.missingFromCollection') }}
                </span>
            </div>
            <ListItemMissingMedia v-else :media-url="item.model.mediaUrl" />
            <MovieWatchingStatus
                v-if="isInstanceOf(item.resolvedMedia, Movie)"
                :movie="item.resolvedMedia"
                class="hidden shrink-0 text-sm sm:flex"
            />
            <ShowWatchingStatus
                v-else-if="isInstanceOf(item.resolvedMedia, Show)"
                :status="item.resolvedMedia.watchingStatus"
                class="hidden shrink-0 text-sm sm:flex"
            />
            <span
                v-else-if="!loading && item.media"
                class="hidden shrink-0 text-sm text-gray-500 sm:inline dark:text-gray-400"
            >
                {{ $t('lists.missingFromCollection') }}
            </span>
        </li>
    </ol>
</template>

<script setup lang="ts">
import { UI } from '@aerogel/core';
import { isInstanceOf } from '@noeldemartin/utils';
import { computed } from 'vue';

import { mediaDisplayName } from '@/lib/media';
import type { ResolvedListItem } from '@lists/lib/composition/items';
import MoviePreviewModal from '@movies/components/modals/MoviePreviewModal.vue';
import Movie from '@movies/models/Movie';
import ShowPreviewModal from '@shows/components/modals/ShowPreviewModal.vue';
import Show from '@shows/models/Show';

const { items, loading } = defineProps<{ items: ResolvedListItem[]; loading?: boolean }>();

const displayItems = computed(() => (loading ? items.map((item) => ({ ...item, resolvedMedia: undefined })) : items));

function tmdbId(item: ResolvedListItem): number | null {
    return item.media?.tmdbId ?? null;
}

async function viewDetails({ media }: ResolvedListItem) {
    if (isInstanceOf(media, Movie)) {
        await UI.modal(MoviePreviewModal, { movie: media });

        return;
    }

    if (isInstanceOf(media, Show)) {
        await UI.modal(ShowPreviewModal, { show: media });
    }
}
</script>
