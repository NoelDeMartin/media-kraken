<template>
    <div class="flex flex-grow flex-col items-center justify-center w-full h-full">
        <BaseIcon name="media-kraken-confused" class="w-48 h-48 mb-4" />
        <h2 class="text-2xl text-center font-semibold mb-4">
            {{ $app.crashReport.message }}
        </h2>
        <div class="flex flex-col gap-2 desktop:flex-row">
            <BaseButton
                class="bg-green-700 text-white hover:bg-green-500"
                icon="reload"
                @click="reload()"
            >
                Try again
            </BaseButton>
            <BaseButton
                class="bg-blue-700 text-white hover:bg-blue-500"
                icon="info"
                @click="inspect()"
            >
                View error details
            </BaseButton>
            <BaseButton
                v-if="$auth.loggedIn"
                class="bg-red-700 text-white hover:bg-red-500"
                icon="logout"
                @click="logout()"
            >
                Logout
            </BaseButton>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import ErrorInfoModal from '@/components/modals/ErrorInfoModal.vue';

export default Vue.extend({
    methods: {
        reload() {
            location.reload();
        },
        inspect() {
            this.$ui.openModal(ErrorInfoModal, { error: this.$app.crashReport!.error });
        },
        async logout() {
            await this.$auth.logout();

            this.$app.clearCrashReport();
        },
    },
});
</script>
