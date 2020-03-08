<template>
    <img v-if="$auth.user.avatarUrl" :src="$auth.user.avatarUrl">
    <div v-else class="overflow-hidden">
        <span class="w-full h-full text-xl flex items-center justify-center text-white bg-kraken-dark">
            {{ ($auth.user.name || '?').substr(0, 1) }}
        </span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({});
</script>
