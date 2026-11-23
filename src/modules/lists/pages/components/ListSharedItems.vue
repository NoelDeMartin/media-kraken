<template>
    <p v-if="items.length === 0" class="mt-8 text-center text-gray-600">
        {{ $t('lists.emptyReadonlyList') }}
    </p>
    <ol v-else class="-mx-4 [counter-reset:list-items] sm:-mx-5">
        <li
            v-for="item of items"
            :key="item.model.url"
            class="before:text-primary-600 flex items-center gap-3 px-2 py-2 [counter-increment:list-items] before:-ml-2 before:w-7 before:shrink-0 before:text-right before:text-lg before:font-semibold before:tabular-nums before:content-[counter(list-items)'.'/''] sm:gap-4 sm:px-3"
        >
            <ListItemPoster :url="item.posterUrl" :missing="!item.name" />
            <div v-if="item.name" class="min-w-0 flex-1">
                <span class="text-normal block truncate leading-5 font-medium">
                    {{ item.name }}
                </span>
                <ListItemMediaType :movie="item.isMovie" :release-year="item.releaseYear" />
                <ul
                    v-if="item.externalUrls.length > 0"
                    :aria-label="$t('lists.externalSites', { name: item.name })"
                    class="mt-1 flex items-center gap-2 sm:hidden"
                >
                    <li v-for="url of item.externalUrls" :key="url">
                        <ExternalSiteLink :url />
                    </li>
                </ul>
            </div>
            <ListItemMissingMedia v-else :media-url="item.model.mediaUrl" />
            <ul
                v-if="item.externalUrls.length > 0"
                :aria-label="$t('lists.externalSites', { name: item.name })"
                class="hidden shrink-0 items-center gap-2 sm:flex"
            >
                <li v-for="url of item.externalUrls" :key="url">
                    <ExternalSiteLink :url />
                </li>
            </ul>
        </li>
    </ol>
</template>

<script setup lang="ts">
import { arrayUnique, isInstanceOf } from '@noeldemartin/utils';
import { computed } from 'vue';

import { mediaDisplayName } from '@/lib/media';
import { useResolvedListItems } from '@lists/lib/composition/items';
import type List from '@lists/models/List';
import Movie from '@movies/models/Movie';

const EXTERNAL_SITES = ['https://www.imdb.com/', 'https://www.themoviedb.org/'];

const { list, foreign } = defineProps<{ list: List; foreign?: boolean }>();
const { items: resolvedItems } = useResolvedListItems(() => list, { foreign });

const items = computed(() =>
    resolvedItems.value.map(({ model, media: itemMedia, resolvedMedia: localMedia }) => {
        const media = itemMedia ?? localMedia;
        const externalUrls = arrayUnique([...(itemMedia?.externalUrls ?? []), ...(localMedia?.externalUrls ?? [])]);

        return {
            model,
            name: media ? mediaDisplayName(media) : null,
            isMovie: isInstanceOf(media, Movie),
            posterUrl: itemMedia?.posterUrl ?? localMedia?.posterUrl,
            releaseYear: itemMedia?.releaseYear ?? localMedia?.releaseYear,
            externalUrls: EXTERNAL_SITES.flatMap((site) => externalUrls.find((url) => url.startsWith(site)) ?? []),
        };
    }),
);
</script>
