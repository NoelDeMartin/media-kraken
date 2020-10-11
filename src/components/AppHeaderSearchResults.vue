<template>
    <div
        role="region"
        aria-label="Search results"
        aria-live="polite"
        class="absolute top-full inset-x-0 -mt-2 bg-white border shadow rounded-lg overflow-hidden z-20"
    >
        <ul>
            <li v-for="result of $search.results" :key="result.id">
                <button
                    v-stop-search
                    type="button"
                    class="w-full flex px-4 py-2 items-center border-b"
                    :title="resultButtonTitle(result)"
                    :class="{
                        'bg-gray-300': $search.highlightedResult === result,
                    }"
                    @click="$search.openResult(result)"
                    @mouseenter="$search.highlightResult(result)"
                >
                    <div
                        class="
                            relative flex-shrink-0
                            w-12 h-12 mr-2 flex items-center justify-center
                            bg-gray-400 border border-gray-400
                        "
                    >
                        <BaseIcon name="photo" class="w-5 h-5 text-gray-600" />
                        <div
                            v-if="result.posterUrl"
                            class="bg-cover bg-center absolute inset-0 w-full h-full"
                            :style="{ backgroundImage: `url('${result.posterUrl}')` }"
                        />
                    </div>
                    <div class="flex flex-col items-start overflow-hidden">
                        <div class="flex items-center max-w-full mb-1">
                            <span class="text-base font-semibold tracking-wide mr-2 truncate">
                                {{ result.title }}
                            </span>
                            <BaseIcon
                                v-if="result.exists()"
                                class="flex-shrink-0 w-4 h-4"
                                :class="{
                                    'text-green-600': result.watched,
                                    'text-blue-600': !result.watched,
                                }"
                                :name="result.watched ? 'checkmark' : 'time'"
                            />
                        </div>
                        <span class="text-sm text-gray-700">
                            {{ result.releaseDate ? result.releaseDate.getFullYear() : '-' }}
                        </span>
                    </div>
                </button>
            </li>
            <li
                v-if="$search.searching"
                class="flex items-center justify-center h-16 text-primary-500"
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
import Services from '@/services';

import LoadingDots from '@/components/LoadingDots.vue';

export default Vue.extend({
    components: {
        LoadingDots,
    },
    directives: {
        stopSearch: {
            bind: el => el.addEventListener('click', () => Services.$search.stop()),
        },
    },
    mounted() {
        this.$search.setSearchResultsContainer(this.$el as HTMLElement);
    },
    destroyed() {
        this.$search.setSearchResultsContainer(null);
    },
    methods: {
        resultButtonTitle(result: SearchResult): string {
            const title = result.title;

            if (!result.exists())
                return title;

            const status = result.watched ? 'Watched' : 'Watch later';

            return `${title} (${status})`;
        },
    },
});
</script>
