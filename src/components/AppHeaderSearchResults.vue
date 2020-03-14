<template>
    <div class="absolute top-full inset-x-0 -mt-2 bg-white border shadow rounded-lg overflow-hidden">
        <ul>
            <li v-for="result of $search.results" :key="result.id">
                <button
                    v-stop-search
                    type="button"
                    class="w-full flex px-4 py-2 items-center border-b"
                    :class="{
                        'bg-gray-300': $search.highlightedResult === result,
                    }"
                    @click="$search.openResult(result)"
                    @mouseenter="$search.highlightResult(result)"
                >
                    <div
                        class="
                            relative overflow-hidden
                            w-12 h-12 mr-2 flex items-center justify-center rounded
                            bg-gray-400 border border-gray-400
                        "
                    >
                        <BaseIcon name="photo" class="w-5 h-5 text-gray-600" />
                        <div
                            class="bg-cover bg-center absolute inset-0 w-full h-full"
                            :style="{ 'background-image': `url('${result.posterUrl}')` }"
                        />
                    </div>
                    <div class="flex flex-col items-start">
                        <span class="text-base font-bold">
                            {{ result.title }}
                        </span>
                        <span class="text-sm text-gray-700">
                            {{ result.releaseYear || '-' }}
                        </span>
                    </div>
                    <div class="flex-grow" />
                    <template v-if="result.collectionUuid">
                        <span
                            v-if="result.watched"
                            class="font-bold text-lg text-green-500"
                        >
                            watched
                        </span>
                        <span
                            v-else
                            class="font-bold text-lg text-blue-500"
                        >
                            pending
                        </span>
                    </template>
                </button>
            </li>
            <li
                v-if="$search.searching"
                class="flex items-center justify-center h-16 text-kraken-dark"
            >
                <LoadingDots />
            </li>
            <li
                v-else-if="$search.results.length === 0"
                class="flex items-center justify-center h-16"
            >
                <span>Not results found.</span>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { SearchResult } from '@/services/Search';

import LoadingDots from '@/components/LoadingDots.vue';

export default Vue.extend({
    components: {
        LoadingDots,
    },
    directives: {
        stopSearch: {
            bind: el => el.addEventListener('click', () => Vue.instance.$search.stop()),
        },
    },
    mounted() {
        this.$search.setSearchResultsContainer(this.$el as HTMLElement);
    },
    destroyed() {
        this.$search.setSearchResultsContainer(null);
    },
});
</script>
