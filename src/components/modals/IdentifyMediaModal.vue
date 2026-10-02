<template>
    <Modal :title="$t('media.identify.title')" wrapper-class="sm:max-w-xl">
        <div class="relative">
            <input
                ref="$inputRef"
                type="search"
                v-model="query"
                :placeholder="$t('media.identify.searchPlaceholder')"
                :aria-label="$t('media.identify.searchPlaceholder')"
                class="focus:ring-focus block w-full rounded-md border-0 py-1.5 pr-2.5 pl-9 text-gray-900 ring-1 ring-gray-900/10 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset"
            />
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                <i-ph-magnifying-glass class="size-5 text-gray-400" />
            </div>
        </div>

        <div v-if="loading" class="py-12 text-center text-gray-500">
            <i-svg-spinners-3-dots-scale-middle class="text-primary h-8 w-full" />
            <span class="sr-only">{{ $t('app.search.loading') }}</span>
        </div>
        <p v-else-if="results.length === 0" class="py-12 text-center text-sm text-gray-500">
            {{ $t('media.identify.noResults') }}
        </p>
        <ul v-else class="mt-4 max-h-96 divide-y divide-gray-100 overflow-y-auto">
            <li v-for="result of results" :key="result.url" class="flex items-center gap-4 py-3">
                <MediaImage :url="result.posterUrl" class="size-12 rounded" />
                <div class="min-w-0 flex-1">
                    <h3 class="truncate text-sm font-medium">
                        {{ 'title' in result ? result.title : result.name }}
                    </h3>
                    <p class="flex items-center gap-1 text-xs text-gray-500">
                        <template v-if="'title' in result">
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
                <Button
                    :aria-label="
                        $t('media.identify.updateA11y', { name: 'title' in result ? result.title : result.name })
                    "
                    @click="selectResult(result)"
                >
                    {{ $t('media.identify.update') }}
                </Button>
            </li>
        </ul>
    </Modal>
</template>

<script setup lang="ts">
import { nextTick, onMounted, useTemplateRef } from 'vue';

import { useMediaSearch, type SearchResult } from '@/lib/composition/search';
import type { TMDBMovie, TMDBShow } from '@/services/TMDB';

const emit = defineEmits<{ close: [{ media: TMDBMovie | TMDBShow }] }>();
const { initialQuery = '' } = defineProps<{ initialQuery: string }>();
const { query, loading, results, getTMDBResult } = useMediaSearch({ initialQuery });
const $inputRef = useTemplateRef('$inputRef');

function selectResult(result: SearchResult) {
    emit('close', { media: getTMDBResult(result) });
}

onMounted(async () => {
    await nextTick();

    $inputRef.value?.focus();
});
</script>
