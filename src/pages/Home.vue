<template>
    <Page>
        <div v-if="loading && isEmpty" class="flex items-center justify-center py-16">
            <i-svg-spinners-3-dots-scale-middle class="text-primary-500 h-8 w-full" />
        </div>
        <Welcome v-else-if="isEmpty" />
        <template v-else>
            <PageTitle class="sr-only">{{ $t('home.title') }}</PageTitle>
            <template v-if="upcomingShows.length > 0">
                <div class="flex items-center justify-between">
                    <SectionTitle>
                        <i-ph-television-simple class="size-6" />
                        {{ $t('home.shows') }}
                    </SectionTitle>
                    <Link route="shows.index" class="flex items-center gap-1 text-sm">
                        <span>{{ $t('home.showsAll') }}</span>
                        <i-ph-arrow-right class="size-4" />
                    </Link>
                </div>
                <MediaGrid class="mt-4" item-width="14rem" :animate="!loadingShows">
                    <ShowWatchingCard v-for="show of upcomingShows" :key="show.url" :show />
                </MediaGrid>
            </template>
            <template v-if="pendingMovies.length > 0">
                <div class="flex items-center justify-between" :class="{ 'mt-8': upcomingShows.length > 0 }">
                    <SectionTitle>
                        <i-ph-film-slate class="size-6" />
                        {{ $t('home.movies') }}
                    </SectionTitle>
                    <Link route="movies.index" class="flex items-center gap-1 text-sm">
                        <span>{{ $t('home.moviesAll') }}</span>
                        <i-ph-arrow-right class="size-4" />
                    </Link>
                </div>
                <MediaGrid
                    class="mt-4"
                    :leave-target="$ui.mobile ? undefined : '#my-collection-menu'"
                    :animate="!loadingMovies"
                >
                    <MovieCard v-for="movie of pendingMovies" :key="movie.url" :movie />
                </MediaGrid>
            </template>
        </template>
    </Page>
</template>

<script setup lang="ts">
import { computedModels, useModels } from '@aerogel/plugin-solid';
import { arraySorted } from '@noeldemartin/utils';
import { computed } from 'vue';

import Movie from '@movies/models/Movie';
import Episode from '@shows/models/Episode';
import Show from '@shows/models/Show';

const SAMPLE_MOVIES_LENGTH = 10;

const { models: shows, loading: loadingShows } = useModels(Show);
const { models: movies, loading: loadingMovies } = useModels(Movie);
const loading = computed(() => loadingShows.value || loadingMovies.value);
const activeShows = computedModels(Show, () => shows.value.filter((show) => show.watchingStatus === 'watching'));
const pendingMovies = computedModels(
    Movie,
    () => {
        const sample: Movie[] = [];
        const sortedMovies = arraySorted(movies.value, 'createdAt', 'desc');

        for (const movie of sortedMovies) {
            if (movie.watched) {
                continue;
            }

            sample.push(movie);

            if (sample.length === SAMPLE_MOVIES_LENGTH) {
                break;
            }
        }

        return sample;
    },
    { cache: 'pendingMovies' },
);
const upcomingShows = computedModels(
    Show,
    () =>
        activeShows.value.filter((show) =>
            show.pendingEpisodes.value?.some(({ publishedAt }) => Episode.isUpcoming(publishedAt)),
        ),
    { watch: ['pendingEpisodes'], cache: 'upcomingShows' },
);
const isEmpty = computed(() => upcomingShows.value.length === 0 && pendingMovies.value.length === 0);
</script>
