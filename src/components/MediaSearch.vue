<template>
    <HeadlessCombobox
        :open
        role="search"
        ref="$comboboxRef"
        wrapper-class="w-full"
        ignore-filter
        @update:open="$emit('update:open', $event)"
        @update:model-value="(value) => value && $emit('select', value as SearchResult)"
    >
        <label class="sr-only" for="global-search">{{ $t('app.search.label') }}</label>
        <div class="relative rounded-md shadow-2xs">
            <HeadlessComboboxInput
                id="global-search"
                type="search"
                class="focus:ring-primary-600 block w-full rounded-md border-0 py-1.5 pr-2.5 pl-9 text-gray-900 ring-1 ring-gray-900/10 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset"
                :model-value="query"
                :placeholder="$t('app.search.placeholder')"
                :display-value="() => ''"
                @update:model-value="(value) => $emit('update:query', value)"
                @keydown.escape="$emit('exit')"
                @blur="$emit('blur')"
            />
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                <i-ph-magnifying-glass class="size-5 text-gray-400" />
            </div>
        </div>

        <HeadlessComboboxContent
            id="search-results"
            class="mt-1 max-h-[calc(100dvh-(--spacing(26)))] w-full overflow-auto rounded-md bg-white p-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden sm:text-sm"
        >
            <div v-if="loading" class="relative cursor-default px-4 py-3 text-center text-sm text-gray-500 select-none">
                <i-svg-spinners-3-dots-scale-middle class="text-primary h-8 w-full" />
                <span class="sr-only">{{ $t('app.search.loading') }}</span>
            </div>
            <HeadlessComboboxEmpty
                v-else-if="results.length === 0"
                class="relative cursor-default px-4 py-3 text-center text-sm text-gray-500 select-none"
            >
                {{ $t('app.search.noResults') }}
            </HeadlessComboboxEmpty>
            <HeadlessComboboxGroup v-else>
                <HeadlessComboboxOption v-for="result of results" :key="result.url" :value="result" as-child>
                    <li
                        :id="`result-${result.url}`"
                        class="relative flex cursor-pointer items-center gap-3 rounded-md px-2 py-1 text-gray-900 transition-colors duration-150 select-none data-highlighted:bg-gray-100 data-highlighted:font-medium data-highlighted:text-gray-900"
                    >
                        <MediaImage :url="result.posterUrl" class="size-12 rounded" />
                        <div class="min-w-0 flex-auto">
                            <p class="truncate text-sm font-medium">
                                {{ isMovie(result) ? result.title : result.name }}
                            </p>
                            <p class="flex items-center gap-1 text-xs text-gray-500">
                                <template v-if="isMovie(result)">
                                    <i-ph-film-slate class="size-4" />
                                    <span class="sr-only">{{ $t('app.search.movie') }} — </span>
                                </template>
                                <template v-else>
                                    <i-ph-television-simple class="size-4" />
                                    <span class="sr-only">{{ $t('app.search.show') }} — </span>
                                </template>
                                {{ result.releaseYear ?? '—' }}
                            </p>
                        </div>
                    </li>
                </HeadlessComboboxOption>
            </HeadlessComboboxGroup>
        </HeadlessComboboxContent>
    </HeadlessCombobox>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';

import Movie from '@/models/Movie';
import Show from '@/models/Show';

type SearchResult = Movie | Show;

defineProps<{
    open: boolean;
    query: string;
    loading: boolean;
    results: SearchResult[];
}>();

defineEmits<{
    'update:open': [value: boolean];
    'update:query': [value: string];
    select: [value: SearchResult];
    exit: [];
    blur: [];
}>();

const $comboboxRef = useTemplateRef('$comboboxRef');

function isMovie(result: SearchResult): result is Movie {
    return result instanceof Movie;
}

defineExpose({
    focus: () => $comboboxRef.value?.focus(),
});
</script>
