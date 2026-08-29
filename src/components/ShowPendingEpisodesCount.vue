<template>
    <span>
        <slot v-if="!pendingEpisodes" name="fallback-loading" />
        <slot v-else-if="pendingEpisodes.length === 0" name="fallback-empty" />
        <template v-else>
            {{ langKey ? $t(langKey, { count: pendingEpisodes.length }) : pendingEpisodes.length }}
        </template>
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useUpcomingEpisodes } from '@/lib/composition/shows';
import Episode from '@/models/Episode';
import type Show from '@/models/Show';

const { show } = defineProps<{ show: Show; langKey?: string }>();
const upcomingEpisodes = useUpcomingEpisodes(show);
const pendingEpisodes = computed(() =>
    upcomingEpisodes.value?.filter((episode) => episode.publishedAt && Episode.isReleased(episode.publishedAt)),
);
</script>
