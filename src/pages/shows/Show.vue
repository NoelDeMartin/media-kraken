<template>
    <Page>
        <h1 class="text-2xl font-semibold text-gray-900">
            {{ show.name }}
        </h1>
    </Page>
</template>

<script setup lang="ts">
import Show from '@/models/Show';

const props = defineProps<{ show: Show }>();
</script>
