<template>
    <p v-if="rows.length === 0" class="mt-8 text-center text-gray-600">
        {{ $t('lists.emptyList') }}
    </p>
    <ol v-else class="-mx-4 [counter-reset:list-items] sm:-mx-5">
        <li
            v-for="({ item, media }, index) of rows"
            :key="item.url"
            class="before:text-primary-600 relative flex items-center gap-3 rounded-lg px-2 py-2 transition-colors [counter-increment:list-items] before:-ml-2 before:w-7 before:shrink-0 before:text-right before:text-lg before:font-semibold before:tabular-nums before:content-[counter(list-items)'.'/''] hover:bg-gray-900/5 sm:gap-4 sm:px-3"
            :class="{
                'cursor-grab active:cursor-grabbing': !disabled,
                'opacity-40': draggedItem === item,
                'after:bg-primary-500 after:pointer-events-none after:absolute after:inset-x-2 after:z-10 after:h-0.5':
                    dropPosition(item),
                'after:-top-px': dropPosition(item) === 'before',
                'after:-bottom-px': dropPosition(item) === 'after',
            }"
            :draggable="!disabled"
            @dragstart="startDragging($event, item)"
            @dragover.prevent="dropTarget = item"
            @drop.prevent="drop(item)"
            @dragend="stopDragging()"
        >
            <MediaImage
                :url="media?.posterUrl"
                class="relative aspect-2/3 w-12 shrink-0 rounded bg-gray-100 shadow-sm"
            />
            <div v-if="media" class="min-w-0 flex-1">
                <Link
                    class="text-normal inline-block min-h-0 max-w-full truncate align-top leading-5 font-medium"
                    :to="media.route"
                    draggable="false"
                >
                    {{ mediaDisplayName(media) }}
                </Link>
                <p class="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <i-ph-film-slate v-if="isInstanceOf(media, Movie)" class="size-4 shrink-0" />
                    <i-ph-television-simple v-else class="size-4 shrink-0" />
                    <span>
                        {{ isInstanceOf(media, Movie) ? $t('lists.movie') : $t('lists.show') }}
                        <template v-if="media.releaseYear">· {{ media.releaseYear }}</template>
                    </span>
                </p>
                <MovieWatchingStatus v-if="isInstanceOf(media, Movie)" :movie="media" class="mt-1 text-xs sm:hidden" />
                <ShowWatchingStatus
                    v-else-if="isInstanceOf(media, Show)"
                    :status="media.watchingStatus"
                    class="mt-1 text-xs sm:hidden"
                />
            </div>
            <div v-else-if="loading" class="min-w-0 flex-1 animate-pulse" aria-hidden="true">
                <div class="h-4 w-40 max-w-full rounded bg-gray-200" />
                <div class="mt-2 h-3 w-20 rounded bg-gray-200" />
            </div>
            <p v-else class="min-w-0 flex-1 truncate text-sm text-gray-500 italic">
                {{ $t('lists.missingMedia') }}
            </p>
            <template v-if="media">
                <MovieWatchingStatus
                    v-if="isInstanceOf(media, Movie)"
                    :movie="media"
                    class="hidden shrink-0 text-sm sm:flex"
                />
                <ShowWatchingStatus
                    v-else-if="isInstanceOf(media, Show)"
                    :status="media.watchingStatus"
                    class="hidden shrink-0 text-sm sm:flex"
                />
            </template>
            <DropdownMenu align="end" :options="itemOptions(item, index)">
                <Button
                    size="icon"
                    variant="ghost"
                    class="-mr-1 shrink-0 rounded-md p-1 text-gray-500 hover:text-gray-900"
                    :title="itemActionsLabel(media)"
                    :disabled
                >
                    <i-mdi-dots-vertical class="size-5" />
                    <span class="sr-only">{{ itemActionsLabel(media) }}</span>
                </Button>
            </DropdownMenu>
        </li>
    </ol>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';
import { computedModel } from '@aerogel/plugin-solid';
import { isInstanceOf } from '@noeldemartin/utils';
import { computed, shallowRef } from 'vue';
import IconMoveToBottom from '~icons/mdi/arrow-collapse-down';
import IconMoveToTop from '~icons/mdi/arrow-collapse-up';
import IconMoveDown from '~icons/mdi/arrow-down';
import IconMoveUp from '~icons/mdi/arrow-up';
import IconRemove from '~icons/ph/trash';

import { mediaDisplayName, type Media } from '@/lib/media';
import { useListMedia } from '@lists/lib/composition/lists';
import type List from '@lists/models/List';
import type ListItem from '@lists/models/ListItem';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

const { list: listProp, disabled } = defineProps<{ list: List; disabled?: boolean }>();
const emit = defineEmits<{ move: [item: ListItem, target: ListItem]; remove: [item: ListItem] }>();
const list = computedModel(() => listProp);
const items = computed(() => list.value.sortedItems);
const { mediaByUrl, loading } = useListMedia(() => list.value.mediaUrls);
const rows = computed(() => items.value.map((item) => ({ item, media: mediaByUrl.value.get(item.mediaUrl) })));
const draggedItem = shallowRef<ListItem | null>(null);
const dropTarget = shallowRef<ListItem | null>(null);

function itemActionsLabel(media: Media | undefined): string {
    return translate('lists.itemActions', { name: media ? mediaDisplayName(media) : translate('lists.missingMedia') });
}

function itemOptions(item: ListItem, index: number) {
    const isFirst = index === 0;
    const isLast = index === items.value.length - 1;

    return [
        !isFirst && { label: translate('lists.moveToTop'), icon: IconMoveToTop, click: () => moveTo(item, 0) },
        !isFirst && { label: translate('lists.moveUp'), icon: IconMoveUp, click: () => moveTo(item, index - 1) },
        !isLast && { label: translate('lists.moveDown'), icon: IconMoveDown, click: () => moveTo(item, index + 1) },
        !isLast && {
            label: translate('lists.moveToBottom'),
            icon: IconMoveToBottom,
            click: () => moveTo(item, items.value.length - 1),
        },
        { label: translate('lists.removeItem'), icon: IconRemove, click: () => emit('remove', item) },
    ];
}

function dropPosition(item: ListItem): 'before' | 'after' | null {
    if (!draggedItem.value || dropTarget.value !== item || draggedItem.value === item) {
        return null;
    }

    return items.value.indexOf(draggedItem.value) < items.value.indexOf(item) ? 'after' : 'before';
}

function moveTo(item: ListItem, index: number) {
    const target = items.value[index];

    target && emit('move', item, target);
}

function startDragging(event: DragEvent, item: ListItem) {
    draggedItem.value = item;

    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', item.mediaUrl);
    }
}

function stopDragging() {
    draggedItem.value = null;
    dropTarget.value = null;
}

function drop(target: ListItem) {
    if (draggedItem.value && draggedItem.value !== target) {
        emit('move', draggedItem.value, target);
    }

    stopDragging();
}
</script>
