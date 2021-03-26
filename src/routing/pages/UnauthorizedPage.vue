<template>
    <div class="flex flex-grow items-center justify-center py-8">
        <div class="flex flex-col items-center max-w-xs">
            <BaseIcon :name="forbidden ? 'media-kraken-confused' : 'media-kraken'" class="w-32 h-32" />
            <template v-if="forbidden">
                <h1 class="mt-4 text-2xl font-semibold">
                    Unauthorized
                </h1>
                <p class="text-sm text-gray-800 text-center leading-relaxed mt-3">
                    I could not access your Solid POD, did you accept the permissions to modify and delete data?
                    If the problem persists, you can try clearing this site's cache from your history or using a
                    different browser.
                </p>
            </template>
            <p v-else class="text-sm text-gray-800 text-center leading-relaxed mt-2">
                Your login credentials have expired, you need to log in again in order to
                continue using the application.
            </p>
            <div class="flex flex-col w-full mt-4">
                <BaseButton
                    v-if="!forbidden"
                    icon="solid-emblem"
                    class="
                        justify-center
                        bg-brand-solid-500 h-10 shadow text-white mt-4
                        text-sm font-medium tracking-wide
                        hover:bg-brand-solid-700
                        desktop:mt-0
                    "
                    @click="refreshCredentials"
                >
                    Refresh credentials
                </BaseButton>
                <BaseButton
                    v-for="(action, index) of actions"
                    :key="index"
                    class="
                        border border-primary-500 mt-4 text-sm text-primary-700 justify-center
                        hover:bg-black-overlay desktop:mt-2
                    "
                    :href="action.url"
                    @click="action.handle && action.handle()"
                >
                    {{ action.label }}
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { arrayFilter } from '@noeldemartin/utils';
import Vue from 'vue';

import ErrorInfoModal from '@/components/modals/ErrorInfoModal.vue';
import SolidAuth from '@/authentication/SolidAuth';

interface Data {
    forbidden: boolean;
}

interface Action {
    label: string;
    url?: string;
    handle?: Function;
}

export default Vue.extend({
    data: (): Data => ({ forbidden: false }),
    computed: {
        actions(): Action[] {
            const githubIssueTitle = 'Login unauthorized';
            const githubIssueBody = 'Please explain how you tried to log in when the error occurred.';

            return arrayFilter([
                this.forbidden && {
                    label: 'Try again',
                    handle: () => this.refreshCredentials(),
                },
                this.forbidden && {
                    label: 'Get help',
                    url: `${this.$app.sourceUrl}/issues/new?title=${githubIssueTitle}&body=${githubIssueBody}`,
                },
                this.$auth.unauthorizedError && {
                    label: this.forbidden ? 'View error details' : 'View details',
                    handle: () => this.$ui.openModal(ErrorInfoModal, { error: this.$auth.unauthorizedError }),
                },
                {
                    label: 'Logout',
                    handle: () => this.$auth.logout(),
                },
            ]);
        },
    },
    created() {
        if (this.$auth.isLoggedIn() && this.$media.loaded)
            this.$router.replace({ name: 'home' });

        if (SolidAuth.previousLogin === null)
            this.$router.replace({ name: 'login' });

        this.forbidden = !!this.$route.query.forbidden;
    },
    methods: {
        async refreshCredentials() {
            const loginUrl =  SolidAuth.previousLogin!.loginUrl;
            const authenticator = SolidAuth.previousLogin!.authenticationMethod;

            try {
                this.$auth.setRefreshing(true);

                await this.$auth.user?.logout();
                await this.$auth.loginWithSolid(loginUrl, authenticator);
            } catch (error) {
                this.$auth.setRefreshing(false);
                this.$ui.showError(error);
            }
        },
    },
});
</script>
