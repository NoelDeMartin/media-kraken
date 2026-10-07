import { computedModelAttribute } from '@aerogel/plugin-solid';
import { arraySorted } from '@noeldemartin/utils';
import { computed } from 'vue';

import Episode from '@/models/Episode';
import type Show from '@/models/Show';

// oxlint-disable-next-line typescript/explicit-module-boundary-types
export function useUpcomingEpisodes(show: Show, options: { sorted?: boolean } = {}) {
    const pendingEpisodes = computedModelAttribute(() => show, 'pendingEpisodes');
    const upcomingEpisodes = computed(() =>
        pendingEpisodes.value?.filter((episode) => Episode.isUpcoming(episode.publishedAt)),
    );

    if (options.sorted) {
        return computed(() => upcomingEpisodes.value && arraySorted(upcomingEpisodes.value, 'publishedAt'));
    }

    return upcomingEpisodes;
}
