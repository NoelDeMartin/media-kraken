<template>
    <div class="flex flex-col flex-grow items-center justify-center py-8">
        <template v-if="!$auth.isLoggedIn()">
            <BaseIcon name="media-kraken" class="w-48 h-48" />
            <h1 class="mt-4 text-3xl font-semibold">
                Media Kraken
            </h1>
            <div class="flex flex-col items-center mt-1 max-w-md">
                <p class="text-sm text-gray-800 text-center leading-relaxed mb-6">
                    Keep track of your movies and create your own collection!
                </p>
                <LoginPrevious
                    v-if="previousLoginUrl"
                    :login-url="previousLoginUrl"
                    @login="loginWithPreviousLogin"
                    @forget="forgetPreviousLogin"
                />
                <LoginSolid
                    v-else-if="loginUrl !== null"
                    :login-url="loginUrl"
                    @updateLoginUrl="loginUrl = $event"
                    @submit="submitLoginWithSolid"
                />
                <div v-else class="flex flex-col items-center">
                    <p class="self-start text-gray-800 mb-3 text-sm">
                        Where do you want to store your data?
                    </p>
                    <BaseButton
                        icon="solid-emblem"
                        class="
                            w-64 h-10 mb-3 text-sm font-medium tracking-wide shadow
                            bg-brand-solid-500 text-white hover:bg-brand-solid-700
                        "
                        @click="loginWithSolid"
                    >
                        Use Solid
                    </BaseButton>
                    <BaseButton
                        icon="browser"
                        class="
                            w-64 h-10 text-sm font-medium tracking-wide shadow
                            text-white bg-blue-500 hover:bg-blue-700
                        "
                        icon-class="w-6 h-4 mr-2"
                        @click="loginOffline"
                    >
                        Use browser storage
                    </BaseButton>
                    <BaseLink
                        class="self-center mt-4 text-sm"
                        @click="$ui.openFileMarkdownModal('application-storage')"
                    >
                        Help me decide what to use
                    </BaseLink>
                </div>
            </div>
        </template>
        <p v-else class="font-medium">
            You are logged in! Please
            <BaseLink route="home" class="underline">
                go home
            </BaseLink>
            or
            <button
                type="button"
                class="font-medium text-primary-700 underline inline-block hover:text-primary-900"
                @click="$auth.logout()"
            >
                logout
            </button>
            first.
        </p>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { AuthenticationMethod } from '@/authentication';
import SolidAuth from '@/authentication/SolidAuth';

import LoginPrevious from '@/components/LoginPrevious.vue';
import LoginSolid from '@/components/LoginSolid.vue';

interface Data {
    loginUrl: string | null;
    previousLoginUrl: string | undefined;
}

export default Vue.extend({
    components: {
        LoginPrevious,
        LoginSolid,
    },
    data: (): Data => ({
        loginUrl: null,
        previousLoginUrl: undefined,
    }),
    created() {
        this.previousLoginUrl = SolidAuth.previousLogin?.loginUrl;
    },
    methods: {
        loginWithSolid() {
            this.loginUrl = 'https://';
        },
        loginOffline() {
            this.$auth.loginOffline();
        },
        async loginWithPreviousLogin() {
            const previousLogin = SolidAuth.previousLogin;

            if (!previousLogin)
                return;

            try {
                await this.$auth.loginWithSolid(previousLogin.loginUrl, previousLogin.authenticationMethod);
            } catch (error) {
                this.$ui.showError(error);
            }
        },
        async submitLoginWithSolid(authenticationMethod?: AuthenticationMethod) {
            if (!this.loginUrl)
                return;

            try {
                await this.replaceLegacyDomains();
                await this.$auth.loginWithSolid(this.loginUrl, authenticationMethod);
            } catch (error) {
                this.$ui.showError(error);
            }
        },
        async forgetPreviousLogin() {
            if (!this.previousLoginUrl)
                return;

            await SolidAuth.logout();

            this.previousLoginUrl = undefined;
        },
        async replaceLegacyDomains() {
            if (!this.isUsingLegacySolidCommunity())
                return;

            const replaceDomain = await this.replaceLegacySolidCommunity();
            if (!replaceDomain)
                return;

            this.loginUrl = this.loginUrl!.replace('solid.community', 'solidcommunity.net');
        },
        isUsingLegacySolidCommunity(): boolean {
            return this.loginUrl!.includes('solid.community');
        },
        replaceLegacySolidCommunity(): Promise<boolean> {
            return this.$ui.confirm(
                [
                    'The `solid.community` domain has been moved to `solidcommunity.net`, ' +
                    'do you want to use that instead?\n',
                    '[learn more](https://gitlab.com/solid.community/proposals/-/issues/16)',
                ].join('\n'),
                { markdown: true },
            );
        },
    },
});
</script>
