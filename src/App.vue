<template>
    <div class="font-montserrat antialiased font-normal text-base text-gray-900 leading-tight bg-gray-100">
        <div class="flex flex-col min-h-screen">
            <AppHeader v-if="$auth.loggedIn" />
            <main class="flex flex-col flex-grow mx-auto max-w-content w-full px-4">
                <router-view />
            </main>
            <AppFooter />
        </div>
        <BaseTransition animation="fade">
            <div v-show="$ui.showOverlay" class="fixed inset-0 z-40">
                <div class="absolute inset-0 bg-gray-500 opacity-75" />
            </div>
        </BaseTransition>
        <BaseTransitionGroup animations="fade scale">
            <aside
                v-for="(modal, index) of $ui.modals"
                :key="modal.id"
                class="
                    fixed inset-0 p-4 z-50 flex items-center justify-center
                    transition-all transform ease-in duration-300
                "
                :class="{ 'opacity-0 scale-90': index < $ui.modals.length - 1 }"
                @click.self="$ui.closeModal(modal.id)"
            >
                <component :is="modal.component" v-bind="modal.props" />
            </aside>
        </BaseTransitionGroup>
        <BaseTransitionGroup
            tag="aside"
            animations="slide-up fade"
            class="
                fixed bottom-0 inset-x-0 p-4
                flex flex-col items-end justify-center
                pointer-events-none z-50
            "
        >
            <AppSnackbar
                v-for="snackbar of $ui.snackbars"
                :id="snackbar.id"
                :key="snackbar.id"
                :message="snackbar.message"
                :options="snackbar.options"
                class="mb-2 last:mb-0"
            />
        </BaseTransitionGroup>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import AppSnackbar from '@/components/AppSnackbar.vue';
import AppFooter from '@/components/AppFooter.vue';
import AppHeader from '@/components/AppHeader.vue';

export default Vue.extend({
    components: {
        AppSnackbar,
        AppFooter,
        AppHeader,
    },
});
</script>

<style lang="scss" src="@/assets/styles/main.scss" />
