<template>
    <form class="self-stretch flex flex-col" @submit.prevent="$emit('submit', authenticationMethod)">
        <input
            ref="login-url-input"
            :value="loginUrl"
            placeholder="Solid POD url"
            class="
                flex-grow shadow p-2 rounded-lg border border-gray-300
                focus:border-primary-500
            "
            @input="$emit('updateLoginUrl', $event.target.value)"
        >
        <div v-if="authenticationMethod">
            <label class="sr-only" for="authentication-method">Authentication method</label>
            <select
                id="authentication-method"
                ref="authentication-method-select"
                v-model="authenticationMethod"
                class="
                    w-full p-2 mt-4 truncate bg-white border border-gray-300 rounded-md shadow-sm
                    focus:border-primary-500
                "
            >
                <option
                    v-for="method of authenticationMethods"
                    :key="method"
                    :value="method"
                >
                    Log in using {{ authenticationMethodNames[method] }}
                </option>
            </select>
            <p class="text-sm text-gray-700 mt-1 leading-relaxed">
                {{ authenticationMethodDescription }}
                <a
                    :href="authenticationMethodUrl"
                    target="_blank"
                    class="text-gray-700 underline hover:text-gray-800"
                >
                    Learn more
                </a>
            </p>
            <div class="h-2" />
        </div>
        <BaseButton
            submit
            icon="solid-emblem"
            class="
                bg-brand-solid-500 h-10 shadow text-white mt-4
                text-sm justify-center font-medium tracking-wide hover:bg-brand-solid-700
            "
        >
            Log in with Solid
        </BaseButton>
        <BaseLink
            v-if="!authenticationMethod"
            class="text-sm self-center mt-4 leading-normal"
            @click="showAuthenticationMethods"
        >
            Can't log in? try using a different authentication method
        </BaseLink>
    </form>
</template>

<script lang="ts">
import Vue from 'vue';

import { AuthenticationMethod, defaultAuthenticationMethod } from '@/authentication';

interface Data {
    authenticationMethod: AuthenticationMethod | null;
}

export default Vue.extend({
    props: {
        loginUrl: {
            type: String,
            required: true,
        },
    },
    data: (): Data => ({
        authenticationMethod: null,
    }),
    computed: {
        authenticationMethods(): AuthenticationMethod[] {
            return Object.values(AuthenticationMethod) as AuthenticationMethod[];
        },
        authenticationMethodNames(): Record<AuthenticationMethod, string> {
            return {
                [AuthenticationMethod.Inrupt]: 'Inrupt\'s authentication library',
                [AuthenticationMethod.Legacy]: 'the legacy authentication library',
            };
        },
        authenticationMethodDescriptions(): Record<AuthenticationMethod, string> {
            return {
                [AuthenticationMethod.Inrupt]:
                    'Inrupt\'s authentication library uses DPoP, and most servers should work using this method.',
                [AuthenticationMethod.Legacy]:
                    'This authentication method is no longer recommended, but some old servers may need to use it.',
            };
        },
        authenticationMethodUrls(): Record<AuthenticationMethod, string> {
            return {
                [AuthenticationMethod.Inrupt]: 'https://github.com/inrupt/solid-client-authn-js',
                [AuthenticationMethod.Legacy]: 'https://github.com/solid/solid-auth-client',
            };
        },
        authenticationMethodDescription(): string | null {
            return this.authenticationMethod && this.authenticationMethodDescriptions[this.authenticationMethod];
        },
        authenticationMethodUrl(): string | null {
            return this.authenticationMethod && this.authenticationMethodUrls[this.authenticationMethod];
        },
    },
    mounted() {
        (this.$refs['login-url-input'] as HTMLInputElement).focus();
    },
    methods: {
        showAuthenticationMethods(): void {
            this.authenticationMethod = defaultAuthenticationMethod;

            this.$nextTick(() => (this.$refs['authentication-method-select'] as HTMLSelectElement).focus());
        },
    },
});
</script>
