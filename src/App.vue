<template>
    <div class="font-montserrat antialiased font-normal text-base text-gray-900 leading-tight bg-gray-100 max-h-screen">
        <div v-if="ready" class="flex flex-col min-h-screen">
            <AppHeader v-if="$media.loaded && !$ui.headerHidden" />
            <main class="flex flex-col flex-grow mx-auto max-w-content w-full px-4">
                <CrashReport v-if="$app.isCrashed" />
                <router-view v-else-if="!$auth.refreshing" />
            </main>
            <AppFooter />
        </div>
        <AppOverlay />
        <AppModals />
        <AppSnackbars />
        <input
            id="file-picker"
            ref="file-picker"
            type="file"
            class="fixed left-full"
        >
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import EventBus from '@/utils/EventBus';
import Files from '@/utils/Files';

import AppFooter from '@/components/AppFooter.vue';
import AppHeader from '@/components/AppHeader.vue';
import AppModals from '@/components/AppModals.vue';
import AppOverlay from '@/components/AppOverlay.vue';
import AppSnackbars from '@/components/AppSnackbars.vue';
import CrashReport from '@/components/CrashReport.vue';

export default Vue.extend({
    components: {
        AppFooter,
        AppHeader,
        AppModals,
        AppOverlay,
        AppSnackbars,
        CrashReport,
    },
    data: () => ({ ready: false }),
    created() {
        EventBus.once('application-ready', () => this.ready = true);
    },
    mounted() {
        Files.setInput(this.$refs['file-picker'] as HTMLInputElement);
    },
});
</script>

<style lang="scss" src="@/assets/styles/main.scss" />
