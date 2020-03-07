<template>
    <div class="relative flex-grow mr-4 z-10">
        <BaseTransition animation="fade">
            <button
                v-show="!$search.searching"
                type="button"
                class="
                    absolute transform -translate-y-1/2 top-1/2
                    flex items-center px-4 py-2
                    rounded text-gray-600 hover:bg-gray-300
                "
                @click="$search.open()"
            >
                <BaseIcon name="search" class="w-4 h-4 mr-2" />
                <span class="text-sm">Press "s" to start searching</span>
            </button>
        </BaseTransition>

        <BaseTransition animations="fade resize">
            <div v-show="$search.searching" class="relative">
                <input
                    ref="search-input"
                    class="
                        w-full
                        bg-white shadow rounded-lg py-2 pr-4 pl-10
                        block appearance-none border border-gray-300
                        focus:border-kraken-light
                    "
                    type="text"
                    autocomplete="off"
                    spellcheck="false"
                    aria-label="Search box"
                    placeholder="Search movies"
                    :value="$search.query"
                    @input="$search.update($event.target.value)"
                    @blur="$search.close()"
                >
                <div class="pointer-events-none absolute inset-y-0 left-0 pl-4 flex items-center">
                    <BaseIcon name="search" class="w-4 h-4 pointer-events-none text-gray-600" />
                </div>
            </div>
        </BaseTransition>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    mounted() {
        this.$search.setSearchInput(this.$refs['search-input'] as HTMLInputElement);
    },
    beforeDestroy() {
        this.$search.setSearchInput(null);
    },
});
</script>
