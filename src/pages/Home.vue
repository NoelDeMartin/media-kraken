<template>
    <Page>
        <Welcome v-if="upcomingShows.length === 0 && pendingMovies.length === 0" />
        <template v-else>
            <h1 class="sr-only">{{ $t('home.title') }}</h1>
            <template v-if="upcomingShows.length > 0">
                <div class="flex items-center justify-between">
                    <h2 class="flex items-center justify-start gap-1 text-xl font-semibold">
                        <i-ph-television-simple class="size-6" />
                        {{ $t('home.shows') }}
                    </h2>
                    <Link route="shows.index" class="flex items-center gap-1 text-sm">
                        <span>{{ $t('home.showsAll') }}</span>
                        <i-ph-arrow-right class="size-4" />
                    </Link>
                </div>
                <MediaGrid class="mt-4" item-width="14rem">
                    <ShowWatchingCard v-for="show of upcomingShows" :key="show.url" :show />
                </MediaGrid>
            </template>
            <template v-if="pendingMovies.length > 0">
                <div class="flex items-center justify-between">
                    <h2
                        class="flex items-center justify-start gap-1 text-xl font-semibold"
                        :class="{ 'mt-8': upcomingShows.length > 0 }"
                    >
                        <i-ph-film-slate class="size-6" />
                        {{ $t('home.movies') }}
                    </h2>
                    <Link route="movies.index" class="flex items-center gap-1 text-sm">
                        <span>{{ $t('home.moviesAll') }}</span>
                        <i-ph-arrow-right class="size-4" />
                    </Link>
                </div>
                <MediaGrid class="mt-4">
                    <MovieCard v-for="movie of pendingMovies" :key="movie.url" :movie />
                </MediaGrid>
            </template>
        </template>
    </Page>
</template>

<script setup lang="ts">
import { computedModels, useModelCollection } from '@aerogel/plugin-solid';

import Episode from '@/models/Episode';
import Movie from '@/models/Movie';
import Show from '@/models/Show';

const shows = useModelCollection(Show);
const movies = useModelCollection(Movie);
const activeShows = computedModels(Show, () => shows.value.filter((show) => show.watchingStatus === 'watching'));
const pendingMovies = computedModels(Movie, () => movies.value.filter((movie) => !movie.watched).slice(0, 20));
const upcomingShows = computedModels(
    Show,
    () =>
        activeShows.value.filter((show) =>
            show.pendingEpisodes.value?.some(({ publishedAt }) => Episode.isUpcoming(publishedAt)),
        ),
    { watch: ['pendingEpisodes'] },
);
</script>
