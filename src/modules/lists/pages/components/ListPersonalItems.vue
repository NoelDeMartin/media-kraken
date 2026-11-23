<template>
    <p v-if="items.length === 0" class="mt-8 text-center text-gray-600">
        {{ $t('lists.emptyList') }}
    </p>
    <ol v-else class="-mx-4 [counter-reset:list-items] sm:-mx-5">
        <li
            v-for="(item, index) of items"
            :key="item.model.url"
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
            <ListItemPoster
                :url="item.resolvedMedia?.posterUrl ?? item.media?.posterUrl"
                :missing="!item.resolvedMedia && !item.media"
            />
            <div v-if="item.resolvedMedia || item.media" class="min-w-0 flex-1">
                <Link
                    v-if="item.resolvedMedia"
                    class="text-normal inline-block min-h-0 max-w-full truncate align-top leading-5 font-medium"
                    :to="item.resolvedMedia.route"
                    draggable="false"
                >
                    {{ mediaDisplayName(item.resolvedMedia) }}
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
            </div>
            <ListItemMissingMedia v-else :media-url="item.model.mediaUrl" />
            <template v-if="item.resolvedMedia">
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
            </template>
            <DropdownMenu align="end" :options="itemOptions(item, index)">
                <Button
                    size="icon"
                    variant="ghost"
                    class="-mr-1 shrink-0 rounded-md p-1 text-gray-500 hover:text-gray-900"
                    :title="item.actionsLabel"
                    :disabled
                >
                    <i-mdi-dots-vertical class="size-5" />
                    <span class="sr-only">{{ item.actionsLabel }}</span>
                </Button>
            </DropdownMenu>
        </li>
    </ol>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';
import { isInstanceOf } from '@noeldemartin/utils';
import { computed, shallowRef } from 'vue';
import IconMoveToBottom from '~icons/mdi/arrow-collapse-down';
import IconMoveToTop from '~icons/mdi/arrow-collapse-up';
import IconMoveDown from '~icons/mdi/arrow-down';
import IconMoveUp from '~icons/mdi/arrow-up';
import IconRemove from '~icons/ph/trash';

import { mediaDisplayName } from '@/lib/media';
import { useResolvedListItems } from '@lists/lib/composition/items';
import type List from '@lists/models/List';
import type ListItem from '@lists/models/ListItem';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

type Item = (typeof items.value)[number];

const { list: listProp, disabled } = defineProps<{ list: List; disabled?: boolean }>();
const emit = defineEmits<{ move: [item: ListItem, target: ListItem]; remove: [item: ListItem] }>();
const { items: resolvedItems } = useResolvedListItems(() => listProp);
const draggedItem = shallowRef<Item | null>(null);
const dropTarget = shallowRef<Item | null>(null);
const items = computed(() =>
    resolvedItems.value.map((item) => {
        const displayMedia = item.resolvedMedia ?? item.media;

        return {
            ...item,
            actionsLabel: displayMedia
                ? translate('lists.itemActions', { name: mediaDisplayName(displayMedia) })
                : translate('lists.missingMedia'),
        };
    }),
);

function itemOptions(item: Item, index: number) {
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
        { label: translate('lists.removeItem'), icon: IconRemove, click: () => emit('remove', item.model) },
    ];
}

function dropPosition(item: Item): 'before' | 'after' | null {
    if (!draggedItem.value || dropTarget.value !== item || draggedItem.value === item) {
        return null;
    }

    return items.value.indexOf(draggedItem.value) < items.value.indexOf(item) ? 'after' : 'before';
}

function moveTo(item: Item, index: number) {
    const target = items.value[index];

    target && emit('move', item.model, target.model);
}

function startDragging(event: DragEvent, item: Item) {
    draggedItem.value = item;

    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', item.model.mediaUrl);
    }
}

function stopDragging() {
    draggedItem.value = null;
    dropTarget.value = null;
}

function drop(target: Item) {
    if (draggedItem.value && draggedItem.value !== target) {
        emit('move', draggedItem.value.model, target.model);
    }

    stopDragging();
}
</script>
