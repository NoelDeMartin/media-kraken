<template>
    <div class="flex flex-col flex-grow items-center justify-center p-8">
        <template v-if="!$auth.isLoggedIn()">
            <BaseIcon name="media-kraken" class="w-48 h-48" />
            <h1 class="mt-4 text-3xl font-semibold">
                Media Kraken
            </h1>
            <div class="flex flex-col items-center mt-1">
                <p class="text-sm text-gray-800 text-center mb-8">
                    Keep track of the movies you want to watch and create your own collection!
                </p>
                <form v-if="identityProviderUrl !== null" class="self-stretch flex flex-col" @submit.prevent="submitLoginWithSolid">
                    <div class="flex flex-col desktop:flex-row">
                        <input
                            ref="solid-input"
                            v-model="identityProviderUrl"
                            placeholder="Solid POD url"
                            class="
                                flex-grow shadow p-2 rounded-lg border border-primary-300
                                focus:border-primary-500
                                desktop:rounded-r-none
                            "
                        >
                        <BaseButton
                            :submit="true"
                            icon="solid-emblem"
                            class="
                                bg-brand-solid h-10 shadow text-white mt-4
                                text-sm font-medium tracking-wide
                                desktop:rounded-l-none desktop:mt-0
                            "
                        >
                            Login <span class="desktop:hidden">with Solid</span>
                        </BaseButton>
                    </div>
                    <BaseButton
                        class="self-center mt-2 text-sm text-primary-700 hover:bg-black-overlay"
                        @click="identityProviderUrl = null"
                    >
                        Cancel
                    </BaseButton>
                </form>
                <template v-else>
                    <div class="flex flex-col items-center desktop:flex-row">
                        <BaseButton
                            icon="solid-emblem"
                            class="
                                w-48 h-10 text-sm font-medium tracking-wide shadow
                                bg-brand-solid text-white
                            "
                            text-class="flex-grow"
                            @click="loginWithSolid"
                        >
                            Login with Solid
                        </BaseButton>
                        <span class="m-2">or</span>
                        <BaseButton
                            icon="offline"
                            class="
                                w-48 h-10 text-sm font-medium tracking-wide shadow
                                text-white bg-primary-500 hover:bg-primary-700
                            "
                            text-class="flex-grow"
                            @click="loginOffline"
                        >
                            Login Offline
                        </BaseButton>
                    </div>
                    <BaseButton
                        class="self-center mt-4 text-sm text-primary-700 hover:bg-black-overlay"
                        @click="$ui.openMarkdownModal('login')"
                    >
                        Which one should I choose?
                    </BaseButton>
                </template>
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

interface Data {
    identityProviderUrl: string | null;
}

export default Vue.extend({
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
    },
});
</script>

<style lang="scss">
    .bg-brand-solid {
        background: #7c4dff;

        &:hover {
            background: #653add;
        }

    }
</style>
