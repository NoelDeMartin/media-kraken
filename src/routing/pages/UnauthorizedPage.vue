<template>
    <div class="flex flex-grow items-center justify-center py-8">
        <div class="flex flex-col items-center max-w-xs">
            <BaseIcon name="media-kraken" class="w-32 h-32" />
            <p class="text-sm text-gray-800 text-center leading-relaxed my-6">
                The credentials from <span class="font-semibold">{{ user.id }}</span> are
                no longer valid, please log in again or log out to use a different account.
            </p>
            <div class="flex flex-col w-full">
                <BaseButton
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
                    class="
                        border border-primary-500 mt-4 text-sm text-primary-700 justify-center
                        hover:bg-black-overlay desktop:mt-2
                    "
                    @click="$auth.logout()"
                >
                    Logout
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import SolidUser from '@/models/users/SolidUser';

export default Vue.extend({
    computed: {
        user(): SolidUser {
            return this.$auth.user as SolidUser;
        },
    },
    created() {
        if (this.$auth.isLoggedIn && this.$media.loaded)
            this.$router.replace({ name: 'home' });
    },
    methods: {
        refreshCredentials() {
            this.$auth.loginWithSolid(this.user.id);
        },
    },
});
</script>
