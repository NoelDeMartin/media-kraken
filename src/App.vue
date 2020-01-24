<template>
    <div
        id="app"
        class="w-screen h-screen flex items-center justify-center bg-gray-300"
    >
        <Home />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Home from '@/pages/Home.vue';

export default Vue.extend({
    components: {
        Home,
    },
});
</script>

<style lang="scss">
    @import "./styles/main.scss";
</style>
