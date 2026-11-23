<template>
    <ListShared v-if="sharing" :key="`shared-${list.url}`" :list :foreign />
    <ListForeign v-else-if="foreign" :key="`foreign-${list.url}`" :list />
    <ListPersonal v-else :key="`personal-${list.url}`" :list />
</template>

<script setup lang="ts">
import { Solid } from '@aerogel/plugin-solid';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import type List from '@lists/models/List';

const { list } = defineProps<{ list: List }>();
const route = useRoute();
const sharing = computed(() => route.query.sharing === 'true');
const foreign = computed(() => list.static().remote && (!list.owner || list.owner !== Solid.user?.webId));
</script>
