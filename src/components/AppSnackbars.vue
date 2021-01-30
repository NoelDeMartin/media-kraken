<template>
    <BaseTransitionGroup
        tag="aside"
        animations="slide-up fade"
        class="
            fixed bottom-0 inset-x-0 p-4
            flex flex-col items-end justify-center
            pointer-events-none z-50
        "
    >
        <AppSnackbar
            v-for="snackbar of $ui.snackbars"
            :id="snackbar.id"
            :key="snackbar.id"
            :message="snackbar.message"
            :options="snackbar.options"
            class="mb-2 last:mb-0"
        />
    </BaseTransitionGroup>
</template>

<script lang="ts">
import Vue from 'vue';

import AppSnackbar from '@/components/AppSnackbar.vue';

export default Vue.extend({
    components: {
        AppSnackbar,
    },
});
</script>
