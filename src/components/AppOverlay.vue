<template>
    <BaseTransition animation="fade">
        <div v-show="$ui.showOverlay" class="fixed inset-0 z-40">
            <div class="absolute inset-0 bg-gray-500 opacity-75" />
        </div>
    </BaseTransition>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({});
</script>
