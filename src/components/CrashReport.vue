<template>
    <div class="flex flex-grow flex-col items-center justify-center w-full h-full">
        <BaseIcon name="media-kraken-confused" class="w-48 h-48 mb-4" />
        <h2 class="text-2xl text-center font-semibold">
            {{ crashReport.title }}
        </h2>
        <p v-if="crashReport.subtitle" class="mt-1 text-sm text-gray-700 text-center">
            {{ crashReport.subtitle }}
        </p>
        <p class="my-4">
            Here's some things you can do:
        </p>
        <div class="flex flex-col gap-2">
            <BaseButton
                v-for="(action, i) in crashReport.actions"
                :key="i"
                class="border border-primary-500 text-sm text-primary-700 justify-center hover:bg-black-overlay"
                @click="action.handle"
            >
                {{ action.label }}
            </BaseButton>
            <BaseButton
                class="border border-primary-500 text-sm text-primary-700 justify-center hover:bg-black-overlay"
                @click="reload()"
            >
                Reload the page
            </BaseButton>
            <BaseButton
                class="border border-primary-500 text-sm text-primary-700 justify-center hover:bg-black-overlay"
                @click="inspect()"
            >
                View error details
            </BaseButton>
            <BaseButton
                v-if="$auth.loggedIn"
                class="border border-primary-500 text-sm text-primary-700 justify-center hover:bg-black-overlay"
                @click="logout()"
            >
                Logout
            </BaseButton>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { CrashReport } from '@/services/App';

import ErrorInfoModal from '@/components/modals/ErrorInfoModal.vue';

export default Vue.extend({
    computed: {
        crashReport(): CrashReport {
            return this.$app.crashReport!;
        },
    },
    methods: {
        reload() {
            location.reload();
        },
        inspect() {
            this.$ui.openModal(ErrorInfoModal, { error: this.crashReport.error });
        },
        async logout() {
            await this.$auth.logout();

            this.$app.clearCrashReport();
        },
    },
});
</script>
