<template>
    <div class="flex flex-col min-h-screen">
        <BaseTransition animation="fade">
            <div v-show="$ui.mobile && $ui.menuOpen" class="fixed inset-0 z-10">
                <div class="w-full h-full bg-black opacity-25" />
            </div>
        </BaseTransition>
        <AppHeader />
        <main class="flex-grow mx-auto max-w-content px-4">
            <router-view />
        </main>
        <AppFooter />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import AppFooter from '@/components/AppFooter.vue';
import AppHeader from '@/components/AppHeader.vue';

export default Vue.extend({
    components: {
        AppFooter,
        AppHeader,
    },
});
</script>
