<template>
    <div class="flex flex-col min-h-screen">
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
