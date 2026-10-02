import { Errors } from '@aerogel/core';
import { debounce, fail } from '@noeldemartin/utils';
import { computed, ref, shallowRef, toRaw, watch } from 'vue';

import Movie from '@/models/Movie';
import Show from '@/models/Show';
import TMDB, { type TMDBSearchResult } from '@/services/TMDB';

export type SearchResult = Movie | Show;

// oxlint-disable-next-line typescript/explicit-module-boundary-types
export function useMediaSearch(options: { initialQuery?: string } = {}) {
    const query = ref(options.initialQuery ?? '');
    const trimmedQuery = computed(() => query.value.trim());
    const loading = ref(false);
    const results = shallowRef<SearchResult[]>([]);
    const tmdbResults = new WeakMap<SearchResult, TMDBSearchResult>();
    const updateSearch = debounce(async () => {
        try {
            const queriedResults = await TMDB.search(trimmedQuery.value);

            results.value = queriedResults.map((tmdb) => {
                const model =
                    tmdb.media_type === 'movie'
                        ? Movie.fromTMDB(tmdb, { posterSize: 'small', mintUrl: true })
                        : Show.fromTMDB(tmdb, { posterSize: 'small', mintUrl: true });

                tmdbResults.set(model, tmdb);

                return model;
            });
        } catch (error) {
            results.value = [];

            void Errors.report(error);
        } finally {
            loading.value = false;
        }
    }, 350);

    function getTMDBResult(result: SearchResult): TMDBSearchResult {
        return tmdbResults.get(toRaw(result)) ?? fail<TMDBSearchResult>('Result not found');
    }

    watch(
        trimmedQuery,
        (newQuery, oldQuery) => {
            if (newQuery === oldQuery) {
                return;
            }

            if (newQuery.length === 0) {
                updateSearch.cancel();
                results.value = [];
                loading.value = false;

                return;
            }

            loading.value = true;
            updateSearch();
        },
        { immediate: true },
    );

    return { query, trimmedQuery, loading, results, getTMDBResult };
}
