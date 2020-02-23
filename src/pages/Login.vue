<template>
    <div class="flex flex-col w-full h-full justify-center items-center">
        <template v-if="!$auth.isLoggedIn()">
            <form class="flex mb-4" @submit.prevent="loginWithSolid">
                <input
                    v-model="idp"
                    type="text"
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight mr-2 focus:outline-none focus:shadow-outline"
                >
                <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-shrink-0">
                    Login with Solid
                </button>
            </form>
            <button
                type="button"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                @click="loginOffline"
            >
                Login Offline
            </button>
        </template>
        <div v-else>
            <p>
                You are logged in! Please
                <router-link
                    :to="{ name: 'home' }"
                    class="text-blue-700 underline inline-block hover:text-blue-900"
                >
                    go home
                </router-link> or
                <button
                    type="button"
                    class="text-blue-700 underline inline-block hover:text-blue-900"
                    @click="$auth.logout()"
                >
                    logout
                </button>
                first.
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    data: () => ({ idp: '' }),
    methods: {
        async loginWithSolid() {
            await this.$auth.loginWithSolid(this.idp);
        },
        async loginOffline() {
            await this.$auth.loginOffline();
        },
    },
});
</script>
