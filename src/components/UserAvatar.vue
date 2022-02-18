<template>
    <img v-if="user.avatarUrl" :src="user.avatarUrl" class="object-cover">
    <div v-else class="overflow-hidden">
        <span class="w-full h-full text-xl flex items-center justify-center text-white bg-primary-500">
            {{ (user.name || '?').substr(0, 1) }}
        </span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import User from '@/models/users/User';

export default Vue.extend({
    computed: {
        user(): User {
            return this.$auth.user!;
        },
    },
});
</script>
