<template>
    <header>
        <div class="mx-auto max-w-content p-4 pt-12">
            <div class="relative flex items-center w-full">
                <router-link :to="{ name: 'home' }" class="mr-4" title="Media Kraken">
                    <Icon name="logo" class="w-auto h-16" />
                </router-link>
                <AppHeaderSearch />
                <AppHeaderProfile />
            </div>
        </div>
    </header>
</template>

<script lang="ts">
import Vue from 'vue';

import AppHeaderProfile from '@/components/AppHeaderProfile.vue';
import AppHeaderSearch from '@/components/AppHeaderSearch.vue';

export default Vue.extend({
    components: {
        AppHeaderProfile,
        AppHeaderSearch,
    },
});
</script>
