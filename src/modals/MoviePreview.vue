<template>
    <AppModal>
        {{ movie.title }}
    </AppModal>
</template>

<script lang="ts">
import Vue from 'vue';

import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';

import AppModal from '@/components/AppModal.vue';

export default Vue.extend({
    components: {
        AppModal,
    },
    props: {
        movie: {
            type: Object as () => ThirdPartyMovie,
            required: true,
        },
    },
});
</script>
