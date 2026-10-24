<template>
    <article
        class="group rounded-card relative isolate flex flex-col overflow-hidden border border-slate-200 bg-white shadow-sm"
    >
        <div class="grid aspect-4/3 grid-cols-4 gap-px bg-slate-100" aria-hidden="true">
            <MediaImage
                v-for="(media, index) of previews"
                :key="media.url ?? index"
                :url="media.posterUrl"
                class="size-full"
            />
            <div
                v-for="index of LIST_PREVIEWS - previews.length"
                :key="`placeholder-${index}`"
                class="size-full bg-slate-50"
            />
        </div>
        <div class="flex flex-col gap-0.5 px-3 py-2">
            <h2 class="truncate font-medium text-gray-900">
                <RouterLink
                    :to="list.route"
                    class="focus-visible:ring-focus focus-visible:ring-offset-background after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2"
                >
                    {{ list.name }}
                </RouterLink>
            </h2>
            <p class="text-xs text-gray-500">{{ $t('lists.itemsCount', { count: list.mediaUrls.length }) }}</p>
        </div>
        <div
            class="pointer-events-none absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
    </article>
</template>

<script lang="ts">
export const LIST_PREVIEWS = 4;
</script>

<script setup lang="ts">
import { computedModel } from '@aerogel/plugin-solid';
import { isTruthy } from '@noeldemartin/utils';
import { computed } from 'vue';

import type { MediaByUrl } from '@lists/lib/composition/lists';
import type List from '@lists/models/List';

const { list: listProp, mediaByUrl } = defineProps<{ list: List; mediaByUrl: MediaByUrl }>();
const list = computedModel(() => listProp);
const previews = computed(() =>
    list.value.mediaUrls
        .slice(0, LIST_PREVIEWS)
        .map((url) => mediaByUrl.get(url))
        .filter(isTruthy),
);
</script>
