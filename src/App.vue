<template>
    <div
        id="app"
        class="w-screen h-screen flex items-center justify-center bg-gray-300"
    >
        <router-view />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({});
</script>

<style lang="scss">
    @import "./styles/main.scss";
</style>
