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
            Here are some things you can do:
        </p>
        <div class="flex flex-col">
            <BaseButton
                v-for="(action, i) in actions"
                :key="i"
                class="border border-primary-500 text-sm text-primary-700 justify-center mb-2 hover:bg-black-overlay"
                @click="action.handle"
            >
                {{ action.label }}
            </BaseButton>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { CrashReport, CrashReportAction } from '@/services/App';

import ErrorInfoModal from '@/components/modals/ErrorInfoModal.vue';

export default Vue.extend({
    computed: {
        crashReport(): CrashReport {
            return this.$app.crashReport!;
        },
        actions(): CrashReportAction[] {
            const actions: CrashReportAction[] = [
                {
                    label: 'Reload the page',
                    priority: 1,
                    handle: () => location.reload(),
                },
                {
                    label: 'View error details',
                    priority: 1,
                    handle: () => this.$ui.openModal(ErrorInfoModal, { error: this.crashReport.error }),
                },
            ];

            if (this.$auth.loggedIn) {
                actions.push({
                    label: 'Logout',
                    priority: 1,
                    handle: async () => {
                        await this.$auth.logout();

                        this.$app.clearCrashReport();
                    },
                });
            }

            actions.push(
                ...this.crashReport.actions.map(
                    action => ({
                        priority: 2,
                        ...action,
                    }),
                ),
            );

            actions.sort((a, b) => b.priority! - a.priority!);

            return actions;
        },
    },
});
</script>
