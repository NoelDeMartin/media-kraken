import { computedModel, useModels } from '@aerogel/plugin-solid';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';

import type { Media } from '@/lib/media';
import type List from '@lists/models/List';
import type ListItem from '@lists/models/ListItem';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

export interface ResolvedListItem {
    model: ListItem;
    media?: Media;
    resolvedMedia?: Movie | Show;
}

export interface ResolvedListItems {
    items: ComputedRef<ResolvedListItem[]>;
    loading: ComputedRef<boolean>;
}

export function useResolvedListItems(list: () => List, options: { foreign?: boolean } = {}): ResolvedListItems {
    const listModel = computedModel(list);
    const mediaUrls = computed(() => listModel.value.sortedItems.map((item) => item.media?.externalUrls ?? []).flat());
    const query = options.foreign ? {} : { urls: mediaUrls };
    const { models: movies, loading: loadingMovies } = useModels(Movie, query);
    const { models: shows, loading: loadingShows } = useModels(Show, query);

    return {
        loading: computed(() => loadingMovies.value || loadingShows.value),
        items: computed(() =>
            listModel.value.sortedItems.map((item) => ({
                model: item,
                media: item.media,
                resolvedMedia:
                    movies.value.find((movie) => item.matches(movie)) ?? shows.value.find((show) => item.matches(show)),
            })),
        ),
    };
}
