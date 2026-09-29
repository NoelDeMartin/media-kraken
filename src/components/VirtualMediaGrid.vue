<template>
    <div class="relative">
        <div
            ref="ruler"
            aria-hidden="true"
            class="invisible absolute inset-x-0 top-0"
            :class="MEDIA_GRID_CLASSES"
            :style="mediaGridStyle(itemWidth)"
        />
        <TransitionGroup
            ref="grid"
            tag="div"
            class="relative"
            :css="false"
            :style="gridStyle"
            @enter="fadeIn"
            @leave="fadeOut"
        >
            <div v-for="entry of renderedItems" :key="entry.key" class="pointer-events-none absolute top-0 left-0">
                <div
                    data-virtual-grid-item
                    class="pointer-events-auto"
                    :class="{ 'transition-transform duration-300 ease-out': animatesMoves }"
                    :style="getItemStyle(entry.index)"
                >
                    <slot :item="entry.item" />
                </div>
            </div>
        </TransitionGroup>
        <slot v-if="items.length === 0" name="empty" />
    </div>
</template>

<script setup lang="ts" generic="T">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch, type StyleValue } from 'vue';

import { fadeInGridItem, fadeOutGridItem, MEDIA_GRID_CLASSES, mediaGridStyle } from '@/lib/media-grid';

const RENDERED_VIEWPORTS_BEYOND_EDGES = 1;

const { items, by } = defineProps<{
    items: T[];
    by: keyof T | ((item: T) => string);
    itemWidth?: string;
}>();

const rulerRef = useTemplateRef('ruler');
const gridRef = useTemplateRef<{ $el: HTMLElement }>('grid');
const columns = ref<null | number>(null);
const columnWidth = ref(0);
const columnGap = ref(0);
const rowGap = ref(0);
const rowHeight = ref<null | number>(null);
const viewportTop = ref(0);
const viewportHeight = ref(0);
const animatesMoves = ref(true);
const getItemKey = computed(() => (typeof by === 'function' ? by : (item: T) => String(item[by])));
const rowStride = computed(() => (rowHeight.value === null ? null : rowHeight.value + rowGap.value));
const totalRows = computed(() => (columns.value ? Math.ceil(items.length / columns.value) : 0));
const firstRenderedRow = computed(() => {
    if (rowStride.value === null) {
        return 0;
    }

    const top = viewportTop.value - viewportHeight.value * RENDERED_VIEWPORTS_BEYOND_EDGES;

    return Math.max(0, Math.floor(top / rowStride.value));
});
const lastRenderedRow = computed(() => {
    if (rowStride.value === null) {
        return 0;
    }

    const bottom = viewportTop.value + viewportHeight.value * (1 + RENDERED_VIEWPORTS_BEYOND_EDGES);

    return Math.min(totalRows.value - 1, Math.floor(bottom / rowStride.value));
});
const renderedItems = computed(() => {
    if (columns.value === null || firstRenderedRow.value > lastRenderedRow.value) {
        return [];
    }

    const start = firstRenderedRow.value * columns.value;
    const end = (lastRenderedRow.value + 1) * columns.value;

    return items.slice(start, end).map((item, offset) => ({
        item,
        key: getItemKey.value(item),
        index: start + offset,
    }));
});
const gridStyle = computed<StyleValue>(() => {
    if (rowHeight.value === null || totalRows.value === 0) {
        return {};
    }

    return { height: `${totalRows.value * rowHeight.value + (totalRows.value - 1) * rowGap.value}px` };
});

let animatesItemsChange = false;
let moveAnimationsFrame: number | null = null;
let viewportUpdateFrame: number | null = null;
let measuredItem: Element | null = null;
const rulerObserver = new ResizeObserver(() => measureColumns());
const itemObserver = new ResizeObserver(([entry]) => entry && measureRowHeight(entry));

function getGridTracks(gridTemplate: string): string[] {
    return gridTemplate.trim().split(/\s+/).filter(Boolean);
}

function getItemStyle(index: number): StyleValue {
    const columnsCount = columns.value ?? 1;
    const column = index % columnsCount;
    const row = Math.floor(index / columnsCount);
    const x = column * (columnWidth.value + columnGap.value);
    const y = row * (rowStride.value ?? 0);

    return {
        width: `${columnWidth.value}px`,
        transform: `translate(${x}px, ${y}px)`,
    };
}

function measureColumns() {
    if (!rulerRef.value) {
        return;
    }

    const computedStyle = window.getComputedStyle(rulerRef.value);
    const columnTracks = getGridTracks(computedStyle.gridTemplateColumns);
    const firstColumnWidth = parseFloat(columnTracks[0] ?? '');

    if (columnTracks.length === 0 || isNaN(firstColumnWidth)) {
        return;
    }

    if (columnTracks.length === columns.value && firstColumnWidth === columnWidth.value) {
        return;
    }

    pauseMoveAnimations();

    columns.value = columnTracks.length;
    columnWidth.value = firstColumnWidth;
    columnGap.value = parseFloat(computedStyle.columnGap) || 0;
    rowGap.value = parseFloat(computedStyle.rowGap) || 0;

    updateViewport();
}

function measureRowHeight(itemEntry: ResizeObserverEntry) {
    const height = itemEntry.borderBoxSize[0]?.blockSize ?? 0;

    if (height === 0 || height === rowHeight.value) {
        return;
    }

    pauseMoveAnimations();

    rowHeight.value = height;
}

function pauseMoveAnimations() {
    animatesMoves.value = false;

    if (moveAnimationsFrame !== null) {
        cancelAnimationFrame(moveAnimationsFrame);
    }

    moveAnimationsFrame = requestAnimationFrame(() => {
        moveAnimationsFrame = null;
        animatesMoves.value = true;
    });
}

function observeFirstRenderedItem() {
    const firstItem = gridRef.value?.$el.querySelector(':not([inert]) > [data-virtual-grid-item]') ?? null;

    if (firstItem === measuredItem) {
        return;
    }

    if (measuredItem) {
        itemObserver.unobserve(measuredItem);
    }

    measuredItem = firstItem;

    if (firstItem) {
        itemObserver.observe(firstItem);
    }
}

function updateViewport() {
    const gridElement = gridRef.value?.$el;

    if (!gridElement) {
        return;
    }

    viewportTop.value = -gridElement.getBoundingClientRect().top;
    viewportHeight.value = window.innerHeight;
}

function scheduleViewportUpdate() {
    if (viewportUpdateFrame !== null) {
        return;
    }

    viewportUpdateFrame = requestAnimationFrame(() => {
        viewportUpdateFrame = null;

        updateViewport();
    });
}

function fadeIn(element: Element, done: () => void) {
    if (!animatesItemsChange) {
        done();

        return;
    }

    fadeInGridItem(element, done);
}

function fadeOut(element: Element, done: () => void) {
    if (!animatesItemsChange) {
        done();

        return;
    }

    fadeOutGridItem(element, done);
}

watch(
    () => items,
    async () => {
        animatesItemsChange = true;

        await nextTick();

        animatesItemsChange = false;

        updateViewport();
    },
);

watch(() => renderedItems.value[0]?.key, observeFirstRenderedItem, { flush: 'post' });

onMounted(() => {
    if (rulerRef.value) {
        rulerObserver.observe(rulerRef.value);
    }

    window.addEventListener('scroll', scheduleViewportUpdate, { passive: true });
    window.addEventListener('resize', scheduleViewportUpdate, { passive: true });
});

onUnmounted(() => {
    rulerObserver.disconnect();
    itemObserver.disconnect();

    window.removeEventListener('scroll', scheduleViewportUpdate);
    window.removeEventListener('resize', scheduleViewportUpdate);

    if (viewportUpdateFrame !== null) {
        cancelAnimationFrame(viewportUpdateFrame);
    }

    if (moveAnimationsFrame !== null) {
        cancelAnimationFrame(moveAnimationsFrame);
    }
});
</script>
