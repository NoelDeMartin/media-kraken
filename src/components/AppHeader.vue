<template>
    <header>
        <div class="mx-auto max-w-content p-4 desktop:pt-12">
            <div class="relative flex items-center w-full justify-end h-16">
                <BaseTransition
                    :enter-duration="300"
                    :leave-duration="100"
                    animation="fade"
                    enter-active-class="delay-200"
                >
                    <button
                        v-show="!$search.open"
                        ref="menu-button"
                        type="button"
                        class="absolute left-0 p-4 rounded text-black z-10 hover:bg-gray-300 desktop:hidden"
                        aria-label="Open menu"
                        @click="$ui.toggleMenu()"
                    >
                        <BaseIcon name="menu" class="w-6 h-6" />
                    </button>
                </BaseTransition>
                <BaseTransition
                    :enter-duration="300"
                    :leave-duration="100"
                    animation="fade"
                    enter-active-class="delay-200"
                >
                    <div
                        v-show="$ui.desktop || !$search.open"
                        class="
                            absolute inset-x-16 inset-y-0 z-10 flex justify-center
                            desktop:relative desktop:inset-auto
                        "
                    >
                        <router-link :to="{ name: 'home' }" class="mr-4" title="Media Kraken">
                            <BaseIcon name="media-kraken" class="w-auto h-16" />
                        </router-link>
                    </div>
                </BaseTransition>
                <AppHeaderSearch />
                <AppHeaderProfile />
            </div>
        </div>
    </header>
</template>

<script lang="ts">
import Vue from 'vue';

import AppHeaderProfile from '@/components/AppHeaderProfile.vue';
import AppHeaderSearch from '@/components/AppHeaderSearch.vue';

export default Vue.extend({
    components: {
        AppHeaderProfile,
        AppHeaderSearch,
    },
    mounted() {
        this.$ui.addMenuTrigger(this.$refs['menu-button'] as HTMLButtonElement);
    },
    beforeDestroy() {
        this.$ui.removeMenuTrigger(this.$refs['menu-button'] as HTMLButtonElement);
    },
});
</script>
