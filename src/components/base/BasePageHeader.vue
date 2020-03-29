<template>
    <div class="flex items-center">
        <slot name="before" />
        <h1 class="text-xl font-medium my-4">
            <slot />
        </h1>
        <slot name="after" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({});
</script>
