<template>
    <svg
        width="60"
        height="15"
        viewBox="0 0 120 30"
        class="loading-dots fill-current"
    >
        <circle cx="15" cy="15" r="15" />
        <circle cx="60" cy="15" r="15" />
        <circle cx="105" cy="15" r="15" />
    </svg>
</template>

<script lang="ts">
import Vue from 'vue';

// Adapted from https://samherbert.net/svg-loaders/
export default Vue.extend({});
</script>

<style lang="scss">
    svg.loading-dots circle:nth-child(1) {
        transform-origin: 12.5% 50%;
    }

    svg.loading-dots circle:nth-child(2) {
        transform-origin: 50% 50%;
    }

    svg.loading-dots circle:nth-child(3) {
        transform-origin: 87.5% 50%;
    }

    svg.loading-dots circle:nth-child(1),
    svg.loading-dots circle:nth-child(3) {
        animation: heartbeat-up 1s infinite;
    }

    svg.loading-dots circle:nth-child(2) {
        animation: heartbeat-down 1s infinite;
    }

    @keyframes heartbeat-up {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(.7); opacity: .3; }
        100% { transform: scale(1); opacity: 1; }
    }

    @keyframes heartbeat-down {
        0% { transform: scale(.7); opacity: .3; }
        50% { transform: scale(1); opacity: 1; }
        100% { transform: scale(.7); opacity: .3; }
    }
</style>
