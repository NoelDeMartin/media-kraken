<template>
    <div class="flex flex-col w-full h-full justify-center items-center">
        <form class="flex mb-4" @submit.prevent="$auth.loginWithSolid(idp);">
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
            @click="$auth.loginOffline()"
        >
            Login Offline
        </button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    data: () => ({ idp: '' }),
});
</script>
