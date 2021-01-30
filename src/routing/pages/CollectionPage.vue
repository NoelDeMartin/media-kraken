<template>
    <CollectionBrowser title="Collection" :search-index="$media.searchIndex" />
</template>

<script lang="ts">
import Vue from 'vue';

import CollectionBrowser from '@/components/CollectionBrowser.vue';

export default Vue.extend({
    components: {
        CollectionBrowser,
    },
    created() {
        if (!this.$media.empty)
            return;

        this.$router.replace({ name: 'home' });
    },
});
</script>
