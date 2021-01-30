<template>
    <h1 class="text-xl font-medium truncate" :class="{ 'my-4': !noMargin }">
        <slot />
    </h1>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        noMargin: {
            type: Boolean,
            default: false,
        },
    },
});
</script>
