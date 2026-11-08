<template>
    <template v-if="ready">
        <AppHeader />
        <RouterView />
    </template>
    <div v-else class="flex flex-1 items-center justify-center py-16">
        <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
    </div>
</template>

<script setup lang="ts">
import { Router } from '@aerogel/plugin-routing';
import { onMounted, onUnmounted, ref } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

import { EMPTY_COLLECTION, seedSampleCollection, type SampleCollection } from '@/lib/storybook/collection';

const { route, empty } = defineProps<{
    route: RouteLocationRaw | ((collection: SampleCollection) => RouteLocationRaw | Promise<RouteLocationRaw>);
    empty?: boolean;
}>();

const ready = ref(false);
let storyUrl = location.href;

const removeBeforeGuard = Router.beforeEach(() => void (storyUrl = location.href));
const removeAfterHook = Router.afterEach(() => history.replaceState(history.state, '', storyUrl));

onMounted(async () => {
    const collection = empty ? EMPTY_COLLECTION : await seedSampleCollection();

    await Router.push(typeof route === 'function' ? await route(collection) : route);

    ready.value = true;
});

onUnmounted(() => {
    removeBeforeGuard();
    removeAfterHook();
});
</script>
