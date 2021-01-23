<template>
    <div
        class="flex items-center h-full"
        :class="{
            'absolute inset-0 justify-end': $ui.mobile,
            'relative justify-start flex-grow mr-4 z-20': $ui.desktop,
        }"
        role="search"
    >
        <BaseTransition animation="fade">
            <button
                v-show="!$search.open"
                type="button"
                class="
                    flex items-center p-4
                    rounded text-black hover:bg-gray-300
                    transform
                    desktop:text-gray-600
                    desktop:absolute desktop:-translate-y-1/2 desktop:top-1/2 desktop:py-2
                "
                title="You can also press &quot;/&quot; to start searching within your collection!"
                @click.stop="$search.start()"
            >
                <BaseIcon name="search" class="w-6 h-6 p-1 desktop:w-4 desktop:h-4 desktop:p-0 desktop:mr-2" />
                <span class="text-sm hidden desktop:block">Press "s" to start searching</span>
            </button>
        </BaseTransition>

        <BaseTransition animations="fade resize-width">
            <div
                v-show="$search.open"
                class="absolute w-full desktop:mt-0 desktop:relative"
                style="min-width:58px"
            >
                <input
                    ref="search-input"
                    class="
                        block w-full py-2 pr-4 pl-10
                        bg-white shadow rounded-lg appearance-none border border-primary-200 focus:border-primary-300
                    "
                    type="text"
                    autocomplete="off"
                    spellcheck="false"
                    aria-label="Search box"
                    placeholder="Search movies"
                    :value="$search.query"
                    @input="$search.update($event.target.value)"
                    @keydown.esc="$search.stop()"
                    @keydown.enter="$search.submit()"
                    @keydown.up="$search.highlightResultAbove()"
                    @keydown.down="$search.highlightResultBelow()"
                >
                <div class="pointer-events-none absolute inset-y-0 left-0 pl-4 flex items-center">
                    <BaseIcon name="search" class="w-4 h-4 pointer-events-none text-gray-600" />
                </div>
            </div>
        </BaseTransition>

        <AppHeaderSearchResults v-show="$search.open && $search.query.length > 0" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import AppHeaderSearchResults from '@/components/AppHeaderSearchResults.vue';

export default Vue.extend({
    components: {
        AppHeaderSearchResults,
    },
    mounted() {
        this.$search.setSearchInput(this.$refs['search-input'] as HTMLInputElement);
    },
    beforeDestroy() {
        this.$search.setSearchInput(null);
    },
});
</script>
