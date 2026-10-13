import { computedModelAttribute } from '@aerogel/plugin-solid';
import { arraySorted } from '@noeldemartin/utils';
import type { ComputedAttribute } from 'soukai-bis';
import type { Ref } from 'vue';
import { computed, onScopeDispose, shallowRef, watch } from 'vue';

import Episode from '@/models/Episode';
import type Show from '@/models/Show';
import type { WatchedEpisodes } from '@/models/Show';

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

export function useWatchedEpisodes(shows: Ref<Show[]>): Readonly<Ref<Map<string, WatchedEpisodes>>> {
    const values = shallowRef(new Map<string, WatchedEpisodes>());
    const subscriptions = new Map<ComputedAttribute<WatchedEpisodes>, () => void>();

    watch(
        shows,
        (currentShows) => {
            const attributes = new Map(
                currentShows.map((show) => [
                    show.getComputedAttribute('watchedEpisodes') as ComputedAttribute<WatchedEpisodes>,
                    show.requireUrl(),
                ]),
            );

            for (const [attribute, unsubscribe] of subscriptions) {
                if (attributes.has(attribute)) {
                    continue;
                }

                unsubscribe();
                subscriptions.delete(attribute);
            }

            for (const [attribute, url] of attributes) {
                if (subscriptions.has(attribute)) {
                    continue;
                }

                subscriptions.set(
                    attribute,
                    attribute.subscribe((value) => {
                        if (!value) {
                            return;
                        }

                        values.value = new Map(values.value).set(url, value);
                    }),
                );
            }

            const urls = new Set(attributes.values());

            if (Array.from(values.value.keys()).some((url) => !urls.has(url))) {
                values.value = new Map(Array.from(values.value).filter(([url]) => urls.has(url)));
            }
        },
        { immediate: true },
    );

    onScopeDispose(() => subscriptions.forEach((unsubscribe) => unsubscribe()));

    return values;
}
