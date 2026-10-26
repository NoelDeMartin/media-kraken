<template>
    <span v-if="readonly" :class="renderedClasses" :title="ratingLabel">
        <component
            :is="starIcon(star)"
            v-for="star in MAX_STARS"
            :key="star"
            :class="['size-4', starClass(star)]"
            aria-hidden="true"
        />
        <span class="sr-only">{{ ratingLabel }}</span>
    </span>
    <RadioGroupRoot
        v-else
        :model-value="selectedRating"
        orientation="horizontal"
        :aria-label="$t('media.rating.label')"
        :aria-describedby="hintId"
        :class="renderedInputClasses"
        @pointerleave="hoveredRating = null"
        @keydown="handleKeydown"
        @focusout="handleFocusout"
    >
        <RadioGroupItem
            :value="MIN_RATING"
            :aria-label="$t('media.rating.rate', { rating: formatRatingAsStars(MIN_RATING) })"
            class="sr-only"
            @click="handleClick(MIN_RATING, $event)"
        />
        <span v-for="star in MAX_STARS" :key="star" class="relative">
            <component
                :is="starIcon(star)"
                :class="[size === 'sm' ? 'size-5' : 'size-6', starClass(star)]"
                aria-hidden="true"
            />
            <RadioGroupItem
                v-for="rating in [starsToRating(star - HALF_STAR), starsToRating(star)]"
                :key="rating"
                :value="rating"
                :aria-label="$t('media.rating.rate', { rating: formatRatingAsStars(rating) })"
                class="absolute inset-y-0 w-1/2 cursor-pointer focus-visible:outline-none"
                :class="rating === starsToRating(star) ? 'right-0' : 'left-0'"
                @pointerenter="hoveredRating = rating"
                @click="handleClick(rating, $event)"
            />
        </span>
        <span :id="hintId" class="sr-only">{{ $t('media.rating.hint') }}</span>
    </RadioGroupRoot>
</template>

<script setup lang="ts">
import { classes, translate } from '@aerogel/core';
import { isInstanceOf } from '@noeldemartin/utils';
import { RadioGroupItem, RadioGroupRoot } from 'reka-ui';
import { computed, nextTick, ref, useId, watch } from 'vue';
import type { HTMLAttributes } from 'vue';
import IconStar from '~icons/mdi/star';
import IconStarHalf from '~icons/mdi/star-half-full';
import IconStarOutline from '~icons/mdi/star-outline';

import { formatRatingAsStars, HALF_STAR, MAX_STARS, ratingToStars, starsToRating } from '@/lib/stars';
import { MIN_RATING } from '@/models/Rating';

const {
    readonly,
    size = 'md',
    class: rootClasses,
} = defineProps<{ readonly?: boolean; size?: 'sm' | 'md'; class?: HTMLAttributes['class'] }>();
const model = defineModel<number | null>({ default: null });
const hintId = useId();
const hoveredRating = ref<number | null>(null);
const draftRating = ref<number | null | undefined>();
const selectedRating = computed(() => (draftRating.value === undefined ? model.value : draftRating.value));
const displayedStars = computed(() => ratingToStars(hoveredRating.value ?? selectedRating.value ?? MIN_RATING));
const renderedClasses = computed(() => classes('inline-flex items-center', rootClasses));
const renderedInputClasses = computed(() =>
    classes(
        'inline-flex items-center rounded-md p-0.5 has-focus-visible:ring-2 has-focus-visible:ring-focus',
        rootClasses,
    ),
);
const ratingLabel = computed(() =>
    model.value === null ? undefined : translate('media.rating.value', { rating: formatRatingAsStars(model.value) }),
);

function starIcon(star: number) {
    if (displayedStars.value >= star) {
        return IconStar;
    }

    return displayedStars.value >= star - HALF_STAR ? IconStarHalf : IconStarOutline;
}

function starClass(star: number): string {
    if (displayedStars.value >= star - HALF_STAR) {
        return 'text-amber-500';
    }

    return selectedRating.value === null ? 'text-gray-400 opacity-50' : 'text-gray-500';
}

function commit() {
    if (draftRating.value === undefined) {
        return;
    }

    if (draftRating.value === model.value) {
        draftRating.value = undefined;

        return;
    }

    model.value = draftRating.value;
}

function handleClick(rating: number, event: MouseEvent) {
    const isKeyboardSelection = event.detail === 0;

    if (isKeyboardSelection) {
        draftRating.value = rating;

        return;
    }

    draftRating.value = rating === model.value ? null : rating;

    if (draftRating.value === null) {
        hoveredRating.value = null;
    }

    commit();
}

function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
        case 'Enter':
            event.preventDefault();
            commit();
            break;
        case 'Escape':
            if (draftRating.value === undefined) {
                return;
            }

            event.stopPropagation();
            draftRating.value = undefined;
            isInstanceOf(event.currentTarget, HTMLElement) && focusSelectedRating(event.currentTarget);
            break;
        case 'Backspace':
        case 'Delete':
            draftRating.value = null;
            break;
    }
}

async function focusSelectedRating(input: HTMLElement) {
    await nextTick();

    input.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')?.focus();
}

function handleFocusout(event: FocusEvent) {
    const input = event.currentTarget;

    if (
        isInstanceOf(input, HTMLElement) &&
        isInstanceOf(event.relatedTarget, Node) &&
        input.contains(event.relatedTarget)
    ) {
        return;
    }

    commit();
}

watch(model, () => (draftRating.value = undefined));
</script>
