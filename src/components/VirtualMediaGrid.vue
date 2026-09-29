<template>
    <div>
        <div
            v-for="(chunk, index) in chunks"
            :key="index"
            :ref="(el) => (chunkRefs[index] = el as HTMLElement | null)"
            :data-chunk-index="index"
            :style="chunkStyles[index]"
        >
            <MediaGrid v-if="isChunkVisible(index)" :item-width v-bind="chunkAttrs">
                <template v-for="item of chunk" :key="getItemKey(item)">
                    <slot :item="item" />
                </template>
            </MediaGrid>
        </div>
        <slot v-if="chunks.length === 0" name="empty" />
    </div>
</template>

<script setup lang="ts" generic="T">
import { arrayChunk } from '@noeldemartin/utils';
import { ref, computed, watch, onMounted, onUnmounted, type StyleValue } from 'vue';

const CHUNK_ROWS = 4;

const { items, by } = defineProps<{
    items: T[];
    by: keyof T | ((item: T) => string);
    itemWidth?: string;
    chunkAttrs?: Record<string, unknown>;
}>();

let resizeObserver: ResizeObserver | null = null;
let intersectionObserver: IntersectionObserver | null = null;
const gap = ref<null | number>(null);
const columns = ref<null | number>(null);
const rowHeight = ref<null | number>(null);
const chunkRefs = ref<(HTMLElement | null)[]>([]);
const chunkVisibility = ref<boolean[]>([]);
const firstChunkEl = computed(() => chunkRefs.value[0]?.querySelector<HTMLDivElement>('.grid') ?? null);
const getItemKey = computed(() => (typeof by === 'function' ? by : (item: T) => String(item[by])));

const chunks = computed(() => {
    const chunkSize = getChunkSize(columns.value);

    if (chunkSize === null) {
        return [items.slice(0, 100)];
    }

    return arrayChunk(items, chunkSize);
});

const chunkStyles = computed(() => {
    const gapValue = gap.value;
    const columnsValue = columns.value;
    const rowHeightValue = rowHeight.value;

    if (gapValue === null || columnsValue === null || rowHeightValue === null) {
        return [];
    }

    return chunks.value.map((chunk, index) => {
        const style: StyleValue = {};
        const isLast = index === chunks.value.length - 1;

        if (!isLast) {
            style.marginBottom = `${gapValue}px`;
        }

        if (isChunkVisible(index)) {
            return style;
        }

        const rows = isLast ? Math.ceil(chunk.length / columnsValue) : CHUNK_ROWS;

        style.height = `${rows * rowHeightValue + (rows - 1) * gapValue}px`;

        return style;
    });
});

function isChunkVisible(index: number) {
    if (index === 0) {
        return true;
    }

    return chunkVisibility.value[index] ?? false;
}

function getChunkSize(columnsValue: null | number) {
    return typeof columnsValue === 'number' ? columnsValue * CHUNK_ROWS : null;
}

function getGridTracks(gridTemplate: string): string[] {
    return gridTemplate.trim().split(/\s+/).filter(Boolean);
}

function measureGrid(el: HTMLElement) {
    const computedStyle = window.getComputedStyle(el);
    const gapValue = parseFloat(computedStyle.rowGap);
    const columnTracks = getGridTracks(computedStyle.gridTemplateColumns);
    const firstRowHeight = parseFloat(getGridTracks(computedStyle.gridTemplateRows)[0] ?? '');

    if (isNaN(gapValue) || isNaN(firstRowHeight) || firstRowHeight <= 0 || columnTracks.length === 0) {
        return;
    }

    gap.value = gapValue;
    rowHeight.value = firstRowHeight;
    columns.value = columnTracks.length;
}

function startObserving(el: HTMLElement) {
    if (resizeObserver) {
        resizeObserver.disconnect();
    }

    resizeObserver = new ResizeObserver((entries) => {
        requestAnimationFrame(() => entries.forEach((entry) => measureGrid(entry.target as HTMLElement)));
    });

    resizeObserver.observe(el);
}

function initIntersectionObserver() {
    intersectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const indexAttr = entry.target.getAttribute('data-chunk-index');

                if (indexAttr === null) {
                    return;
                }

                const index = parseInt(indexAttr, 10);

                chunkVisibility.value[index] = entry.isIntersecting;
            });
        },
        {
            rootMargin: '150% 0px',
        },
    );

    chunkRefs.value.forEach((el) => {
        if (!el) {
            return;
        }

        intersectionObserver?.observe(el);
    });
}

watch(
    firstChunkEl,
    (newEl) => {
        if (newEl) {
            startObserving(newEl);

            return;
        }

        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
    },
    { immediate: true },
);

watch(
    () => [...chunkRefs.value],
    (newRefs, oldRefs) => {
        if (!intersectionObserver) {
            return;
        }

        if (oldRefs) {
            oldRefs.forEach((el) => {
                if (!el || newRefs.includes(el)) {
                    return;
                }

                intersectionObserver?.unobserve(el);
            });
        }

        newRefs.forEach((el) => {
            if (!el) {
                return;
            }

            intersectionObserver?.observe(el);
        });
    },
    { flush: 'post' },
);

onMounted(() => initIntersectionObserver());

onUnmounted(() => {
    if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
    }

    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
});
</script>
