<template>
    <span>
        <slot v-if="!pendingEpisodes" name="fallback-loading" />
        <template v-else>
            {{ langKey ? $t(langKey, { count: pendingEpisodes.length }) : pendingEpisodes.length }}
        </template>
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useUpcomingEpisodes } from '@shows/lib/composition/shows';
import Episode from '@shows/models/Episode';
import type Show from '@shows/models/Show';

const { show } = defineProps<{ show: Show; langKey?: string }>();
const upcomingEpisodes = useUpcomingEpisodes(show);
const pendingEpisodes = computed(() =>
    upcomingEpisodes.value?.filter((episode) => episode.publishedAt && Episode.isReleased(episode.publishedAt)),
);
</script>
