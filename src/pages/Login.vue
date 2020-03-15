<template>
    <div class="w-screen h-screen flex flex-col items-center justify-center bg-kraken-lightest p-8">
        <template v-if="!$auth.isLoggedIn()">
            <BaseIcon name="logo" class="w-48 h-48" />
            <h1 class="mt-4 text-3xl font-semibold">
                Media Kraken
            </h1>
            <p class="mt-1 text-sm text-gray-800 text-center">
                Keep track of the movies you want to watch and create your own collection!
            </p>
            <div class="flex flex-col mt-8">
                <form v-if="identityProviderUrl !== null" class="flex" @submit.prevent="submitLoginWithSolid">
                    <input
                        ref="solid-input"
                        v-model="identityProviderUrl"
                        placeholder="Solid POD url"
                        class="shadow p-2 rounded-l-lg border border-kraken-light focus:border-kraken-dark"
                    >
                    <button
                        type="submit"
                        class="flex items-center bg-purple-700 p-2 mr-2 h-10 rounded-r-lg shadow text-white hover:bg-purple-800"
                    >
                        <BaseIcon name="solid-emblem" class="w-6 h-6 mr-2" />
                        <span class="text-sm font-medium tracking-wide mr-1">Login</span>
                    </button>
                </form>
                <template v-else>
                    <div class="flex flex-col items-center desktop:flex-row">
                        <button
                            type="button"
                            class="flex items-center bg-purple-700 p-2 h-10 rounded-lg shadow text-white hover:bg-purple-800"
                            @click="loginWithSolid"
                        >
                            <BaseIcon name="solid-emblem" class="w-6 h-6 mr-2" />
                            <span class="text-sm font-medium tracking-wide mr-1">Login with Solid</span>
                        </button>
                        <span class="m-2">or</span>
                        <button
                            type="button"
                            class="flex items-center bg-kraken-dark p-2 h-10 rounded-lg shadow text-white hover:bg-kraken-darker"
                            @click="loginOffline"
                        >
                            <BaseIcon name="offline" class="w-5 h-5 mr-2" />
                            <span class="text-sm font-medium tracking-wide mr-1">Login Offline</span>
                        </button>
                    </div>
                    <button
                        type="button"
                        class="mt-4 self-center text-sm text-kraken-darker hover:underline hover:text-kraken-darkest"
                        @click="showHelp"
                    >
                        Do you need help?
                    </button>
                </template>
            </div>
        </template>
        <p v-else class="font-medium">
            You are logged in! Please
            <router-link
                :to="{ name: 'home' }"
                class="text-kraken-darker underline inline-block hover:text-kraken-darkest"
            >
                go home
            </router-link> or
            <button
                type="button"
                class="text-kraken-darker underline inline-block hover:text-kraken-darkest"
                @click="$auth.logout()"
            >
                logout
            </button>
            first.
        </p>
        <AppFooter class="fixed bottom-0 inset-x-0" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import AppFooter from '@/components/AppFooter.vue';

import LoginHelp from '@/modals/LoginHelp.vue';

interface Data {
    identityProviderUrl: string | null;
}

export default Vue.extend({
    components: {
        AppFooter,
    },
    data: (): Data => ({ identityProviderUrl: null }),
    methods: {
        loginWithSolid() {
            this.identityProviderUrl = 'https://';

            this.$nextTick(() => (this.$refs['solid-input'] as HTMLInputElement).focus());
        },
        loginOffline() {
            this.$auth.loginOffline();
        },
        async submitLoginWithSolid() {
            try {
                await this.$auth.loginWithSolid(this.identityProviderUrl!);
            } catch (error) {
                alert(error.message || 'Something went wrong');
            }
        },
        showHelp() {
            this.$ui.openModal(LoginHelp);
        },
    },
});
</script>
