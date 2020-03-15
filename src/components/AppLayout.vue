<template>
    <div class="flex flex-col min-h-screen">
        <AppHeader />
        <main class="flex flex-col flex-grow mx-auto max-w-content w-full px-4">
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
