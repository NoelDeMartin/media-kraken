<template>
    <header>
        <div class="mx-auto max-w-content p-4 desktop:pt-12">
            <div
                class="relative flex items-center w-full justify-between"
                :class="{
                    'flex-col': $ui.mobile && $search.searching,
                }"
            >
                <button
                    v-show="!$search.searching"
                    ref="menu-button"
                    type="button"
                    class="p-4 rounded text-black hover:bg-gray-300 desktop:hidden"
                    @click="$ui.toggleMenu()"
                >
                    <BaseIcon name="menu" class="w-6 h-6" />
                </button>
                <router-link :to="{ name: 'home' }" class="mr-4" title="Media Kraken">
                    <BaseIcon name="logo" class="w-auto h-16" />
                </router-link>
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
