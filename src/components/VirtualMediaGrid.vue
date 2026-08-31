<template>
    <div>
        <div
            v-for="(chunk, index) in chunks"
            :key="index"
            :ref="(el) => (chunkRefs[index] = el as HTMLElement | null)"
            :data-chunk-index="index"
            :style="chunkStyles[index]"
        >
            <MediaGrid v-if="isChunkVisible(index)" :item-width>
                <template v-for="item of chunk" :key="getItemKey(item)">
                    <slot :item="item" />
                </template>
            </MediaGrid>
        </div>
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
}>();

let resizeObserver: ResizeObserver | null = null;
let intersectionObserver: IntersectionObserver | null = null;
const gap = ref<null | number>(null);
const columns = ref<null | number>(null);
const fullChunkHeight = ref<null | number>(null);
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

const rowHeight = computed(() => {
    if (fullChunkHeight.value === null || gap.value === null) {
        return null;
    }

    return (fullChunkHeight.value - (CHUNK_ROWS - 1) * gap.value) / CHUNK_ROWS;
});

const chunkStyles = computed(() => {
    const gapValue = gap.value;
    const columnsValue = columns.value;
    const rowHeightValue = rowHeight.value;
    const fullChunkHeightValue = fullChunkHeight.value;

    if (gapValue === null || columnsValue === null || rowHeightValue === null || fullChunkHeightValue === null) {
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

        if (isLast) {
            const rows = Math.ceil(chunk.length / columnsValue);

            style.height = `${rows * rowHeightValue + (rows - 1) * gapValue}px`;
        } else {
            style.height = `${CHUNK_ROWS * rowHeightValue + (CHUNK_ROWS - 1) * gapValue}px`;
        }

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

function measureGrid(el: HTMLElement) {
    let columnsValue: null | number = columns.value;
    const computedStyle = window.getComputedStyle(el);
    const gapValue = parseFloat(computedStyle.rowGap);
    const gridTemplateColumns = computedStyle.gridTemplateColumns;

    if (gridTemplateColumns) {
        const cols = gridTemplateColumns.trim().split(/\s+/).length;

        if (cols > 0 && cols !== columns.value) {
            columnsValue = columns.value = cols;
        }
    }

    if (!isNaN(gapValue) && gapValue !== gap.value) {
        gap.value = gapValue;
    }

    const rect = el.getBoundingClientRect();

    if (rect.height > 0) {
        const chunkSize = getChunkSize(columnsValue);

        if (
            chunkSize !== null &&
            el.children.length === chunkSize &&
            items.length >= chunkSize &&
            rect.height !== fullChunkHeight.value
        ) {
            fullChunkHeight.value = rect.height;
        }
    }
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
