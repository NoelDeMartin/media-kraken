<template>
    <span>
        <slot v-if="!upcomingEpisodes" name="fallback-loading" />
        <slot v-else-if="upcomingEpisodes.length === 0" name="fallback-empty" />
        <template v-else>
            {{ langKey ? $t(langKey, { count: upcomingEpisodes.length }) : upcomingEpisodes.length }}
        </template>
    </span>
</template>

<script setup lang="ts">
import { computedModelAttribute } from '@aerogel/plugin-solid';
import { computed } from 'vue';

import Episode from '@/models/Episode';
import type Show from '@/models/Show';

const { show } = defineProps<{ show: Show; langKey?: string }>();
const pendingEpisodeDates = computedModelAttribute(() => show, 'pendingEpisodeDates');
const upcomingEpisodes = computed(() => pendingEpisodeDates.value?.filter((date) => date && Episode.isUpcoming(date)));
</script>
