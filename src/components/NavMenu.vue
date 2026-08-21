<template>
    <div
        ref="wrapper"
        class="group relative"
        :style="{
            '--item-height': sizes ? `${sizes.itemHeight}px` : '0px',
            '--max-item-width': sizes ? `${sizes.maxItemWidth}px` : '0px',
            '--menu-height': sizes ? `${sizes.itemHeight * (sections.length + 1)}px` : '0px',
        }"
        @focusin="expand"
        @focusout="collapse"
        @mouseenter="expand"
        @mouseleave="collapse"
    >
        <div class="h-(--item-height) min-w-[calc(var(--max-item-width)+(--spacing(1)))]" />
        <div
            :class="[
                'absolute top-0 left-0 h-(--item-height) overflow-hidden',
                open && 'h-(--menu-height) -translate-y-(--item-height)',
                animate && 'transition-all duration-300 ease-in-out',
            ]"
        >
            <div
                :class="[
                    '-translate-y-(--drift) pl-1 whitespace-nowrap',
                    open && 'pt-(--drift)',
                    animate && 'transition-all duration-300 ease-in-out',
                ]"
                :style="{
                    '--drift':
                        sizes && activeSectionIndex !== -1 ? `${(activeSectionIndex + 1) * sizes.itemHeight}px` : '0px',
                }"
            >
                <div
                    :class="[
                        'flex h-(--item-height) items-center text-sm',
                        open && 'translate-y-2 text-xs opacity-50',
                        animate && 'transition-all duration-300 ease-in-out',
                    ]"
                >
                    {{ label }}
                </div>
                <ul>
                    <li
                        v-for="(section, index) of sections"
                        :key="section.route"
                        :class="{ 'font-bold': activeSectionIndex === index }"
                    >
                        <Link :route="section.route" @click="open = false" class="text-primary-text">
                            {{ section.label }}
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Router } from '@aerogel/plugin-routing';
import { after } from '@noeldemartin/utils';
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';

const { sections, startOpen, selectedIndex } = defineProps<{
    label: string;
    sections: { route: string; label: string }[];
    startOpen?: boolean;
    selectedIndex?: number;
}>();

const open = ref(startOpen ?? false);
const animate = ref(false);
const $wrapper = useTemplateRef('wrapper');
const sizes = ref<{ itemHeight: number; maxItemWidth: number } | null>(null);
const activeSectionIndex = computed(
    () =>
        selectedIndex ??
        sections.findIndex((section) => Router.currentRoute.value && Router.currentRoute.value.name === section.route),
);
const observer = new ResizeObserver(() => {
    if (!$wrapper.value) {
        return;
    }

    const [firstItemRect, ...restItemRects] = Array.from($wrapper.value.querySelectorAll('li')).map((item) =>
        item.getBoundingClientRect(),
    );

    if (!firstItemRect) {
        return;
    }

    sizes.value = {
        itemHeight: firstItemRect.height,
        maxItemWidth: Math.max(firstItemRect.width, ...restItemRects.map((item) => item.width)),
    };
});

function expand() {
    open.value = true;
}

function collapse() {
    open.value = false;
}

watch(
    $wrapper,
    (value, oldValue) => {
        oldValue && observer.unobserve(oldValue); // oxlint-disable-line no-unused-expressions
        value && observer.observe(value); // oxlint-disable-line no-unused-expressions
    },
    { immediate: true },
);

onMounted(async () => {
    await after(300);

    animate.value = true;
});

onUnmounted(() => observer.disconnect());
</script>
