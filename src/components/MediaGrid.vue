<template>
    <TransitionGroup
        tag="div"
        :move-class="animationsEnabled ? 'transition-transform duration-300 ease-out' : undefined"
        :css="false"
        :class="renderedClasses"
        :style="mediaGridStyle(itemWidth)"
        @enter="(el, done) => (animationsEnabled ? fadeInGridItem(el, done) : done())"
        @before-leave="(el) => animationsEnabled && takeOutOfGridFlow(el)"
        @leave="(el, done) => (animationsEnabled ? flyOut(el, done) : done())"
    >
        <slot />
    </TransitionGroup>
</template>

<script setup lang="ts">
import { classes } from '@aerogel/core';
import { isInstanceOf } from '@noeldemartin/utils';
import { computed, type HTMLAttributes } from 'vue';

import { useGridAnimations } from '@/lib/composition/grids';
import { fadeInGridItem, fadeOutGridItem, flyOutGridItem, MEDIA_GRID_CLASSES, mediaGridStyle } from '@/lib/media-grid';

const {
    class: rootClass = '',
    itemWidth,
    leaveTarget,
    animate = true,
} = defineProps<{
    class?: HTMLAttributes['class'];
    itemWidth?: string;
    leaveTarget?: string;
    animate?: boolean;
}>();

const renderedClasses = computed(() => classes('relative', MEDIA_GRID_CLASSES, rootClass));
const { animationsEnabled } = useGridAnimations(() => animate);

function takeOutOfGridFlow(element: Element) {
    if (!isInstanceOf(element, HTMLElement)) {
        return;
    }

    const { clientWidth, offsetTop, offsetLeft } = element;

    element.style.position = 'absolute';
    element.style.width = `${clientWidth}px`;
    element.style.top = `${offsetTop}px`;
    element.style.left = `${offsetLeft}px`;
}

function flyOut(element: Element, done: () => void) {
    const target = leaveTarget ? document.querySelector(leaveTarget) : null;

    if (target) {
        flyOutGridItem(element, target, done);

        return;
    }

    fadeOutGridItem(element, done);
}
</script>
