<template>
    <div
        class="relative desktop:flex-grow desktop:mr-4 desktop:z-10"
        :class="{
            'w-full': $ui.mobile && $search.searching,
        }"
    >
        <BaseTransition :enabled="$ui.desktop" animation="fade">
            <button
                v-show="!$search.searching"
                type="button"
                class="
                    flex items-center p-4
                    rounded text-black hover:bg-gray-300
                    transform
                    desktop:text-gray-600
                    desktop:absolute desktop:-translate-y-1/2 desktop:top-1/2 desktop:py-2
                "
                @click="$search.open()"
            >
                <BaseIcon name="search" class="w-6 h-6 p-1 desktop:w-4 desktop:h-4 desktop:p-0 desktop:mr-2" />
                <span class="text-sm hidden desktop:block">Press "s" to start searching</span>
            </button>
        </BaseTransition>

        <BaseTransition :enabled="$ui.desktop" animations="fade resize">
            <div v-show="$search.searching" class="relative mt-4 desktop:mt-0">
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
