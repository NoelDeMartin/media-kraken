<template>
    <AppModal class="flex items-center p-4" :cancelable="false" @close="$ui.closeModal(id)">
        <LoadingCircle class="w-8 h-8 text-kraken-darker mr-4" />
        <p>{{ message }}</p>
    </AppModal>
</template>

<script lang="ts">
import Vue from 'vue';

import AppModal from '@/components/AppModal.vue';
import LoadingCircle from '@/components/LoadingCircle.vue';

export default Vue.extend({
    components: {
        AppModal,
        LoadingCircle,
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            default: 'Loading...',
        },
    },
});
</script>
