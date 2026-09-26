<template>
    <div :class="renderedClasses">
        <div v-if="searching" class="relative h-8 min-w-3">
            <input
                ref="$inputRef"
                type="text"
                class="focus:border-b-primary absolute inset-0 border-x-0 border-t-0 border-b-2 border-b-gray-300 bg-transparent p-0 focus:ring-0"
                v-model="query"
                :aria-label="renderedSearchingLabel"
                :placeholder="renderedPlaceholder"
                @blur="onBlur"
            />
            <span class="pointer-events-none opacity-0" aria-hidden="true">{{ query || renderedPlaceholder }}</span>
        </div>
        <Button v-else variant="ghost" @click="query = ''" :title="renderedLabel">
            <i-mdi-magnify class="size-6" />
            <span class="sr-only">{{ renderedLabel }}</span>
        </Button>
    </div>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';
import { computed, nextTick, useTemplateRef, watch, type HTMLAttributes } from 'vue';

const { label, placeholder, searchingLabel, searchingClass } = defineProps<{
    label?: string;
    placeholder?: string;
    searchingLabel?: string;
    searchingClass?: HTMLAttributes['class'];
}>();
const query = defineModel<string | null>();
const $input = useTemplateRef('$inputRef');
const searching = computed(() => query.value !== null);
const renderedClasses = computed(() => (searching.value ? searchingClass : ''));
const renderedLabel = computed(() => label ?? translate('ui.searchLabel'));
const renderedSearchingLabel = computed(() => searchingLabel ?? translate('ui.searchLabel'));
const renderedPlaceholder = computed(() => placeholder ?? translate('ui.searchPlaceholder'));

function onBlur() {
    if (query.value !== '') {
        return;
    }

    query.value = null;
}

watch(query, async (newValue, oldValue) => {
    if (oldValue !== null || newValue === null) {
        return;
    }

    await nextTick();

    $input.value?.focus();
});
</script>
