<template>
    <div class="rounded-card bg-white p-5 shadow-sm">
        <h4 v-if="title" class="mb-4 font-medium">{{ title }}</h4>
        <slot />
    </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>();
</script>
