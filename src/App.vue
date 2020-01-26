<template>
    <div
        id="app"
        class="w-screen h-screen flex items-center justify-center bg-gray-300"
    >
        <Home v-if="$auth.loggedIn" />
        <Login v-else />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Home from '@/pages/Home.vue';
import Login from '@/pages/Login.vue';

export default Vue.extend({
    components: {
        Home,
        Login,
    },
});
</script>

<style lang="scss">
    @import "./styles/main.scss";
</style>
