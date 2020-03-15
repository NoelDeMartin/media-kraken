<template>
    <AppModal :cancelable="false" @close="ui.closeModal(id)">
        <div class="flex items-center">
            <LoadingCircle class="w-8 h-8 text-kraken-darker mr-4" />
            <p>{{ message }}</p>
        </div>
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
