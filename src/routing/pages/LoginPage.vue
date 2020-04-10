<template>
    <div class="flex flex-col flex-grow items-center justify-center py-8">
        <template v-if="!$auth.isLoggedIn()">
            <BaseIcon name="media-kraken" class="w-48 h-48" />
            <h1 class="mt-4 text-3xl font-semibold">
                Media Kraken
            </h1>
            <div class="flex flex-col items-center mt-1">
                <p class="text-sm text-gray-800 text-center leading-relaxed mb-6">
                    Keep track of the movies you want to watch and create your own collection!
                </p>
                <form
                    v-if="identityProviderUrl !== null"
                    class="self-stretch flex flex-col"
                    @submit.prevent="submitLoginWithSolid"
                >
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
                            submit
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
                    <div class="flex flex-col-reverse justify-between desktop:flex-row">
                        <BaseLink
                            button
                            class="text-sm self-center mt-4 desktop:mt-2 desktop:self-start"
                            @click="$ui.openMarkdownModal('application-storage')"
                        >
                            I need help
                        </BaseLink>
                        <BaseButton
                            class="
                                border border-primary-500 mt-4 text-sm text-primary-700 justify-center
                                hover:bg-black-overlay desktop:mt-2
                            "
                            @click="identityProviderUrl = null"
                        >
                            Cancel
                        </BaseButton>
                    </div>
                </form>
                <template v-else>
                    <div class="flex flex-col items-center">
                        <p class="self-start text-gray-800 mb-3 text-sm">
                            Where do you want to store your data?
                        </p>
                        <BaseButton
                            icon="solid-emblem"
                            class="
                                w-64 h-10 mb-3 text-sm font-medium tracking-wide shadow
                                bg-brand-solid text-white
                            "
                            @click="loginWithSolid"
                        >
                            Use Solid POD
                        </BaseButton>
                        <BaseButton
                            icon="browser"
                            class="
                                w-64 h-10 text-sm font-medium tracking-wide shadow
                                text-white bg-brand-browser
                            "
                            icon-class="w-6 h-4 mr-2"
                            @click="loginOffline"
                        >
                            Use browser storage
                        </BaseButton>
                        <BaseLink
                            button
                            class="self-center mt-4 text-sm"
                            @click="$ui.openMarkdownModal('application-storage')"
                        >
                            Help me decide what to use
                        </BaseLink>
                    </div>
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
                this.$ui.showError(error);
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

    .bg-brand-browser {
        @apply bg-blue-500;

        &:hover {
            @apply bg-blue-700;
        }

    }
</style>
