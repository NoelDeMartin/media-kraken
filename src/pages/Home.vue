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
                <MediaGrid
                    :as="TransitionGroup"
                    tag="div"
                    class="relative mt-4"
                    ref="moviesGrid"
                    enter-active-class="transition-all ease-out duration-300"
                    enter-from-class="opacity-0"
                    leave-active-class="transition-all ease-in duration-300"
                    leave-to-class="opacity-0"
                    move-class="transition-all ease-out duration-300"
                    @before-leave="sendMovieToCollection"
                >
                    <MovieCard v-for="movie of pendingMovies" :key="movie.url" :movie />
                </MediaGrid>
                <div
                    v-if="pendingMovies.length === SAMPLE_MOVIES_LENGTH"
                    class="mt-4 flex items-center justify-center text-sm"
                >
                    <span>{{ moreMoviesParts.start.replace(/ $/, '\u00A0') }}</span>
                    <Link route="movies.index">{{ $t('home.moreMoviesLink') }}</Link>
                    <span>{{ moreMoviesParts.end.replace(/^ /, '\u00A0') }}</span>
                </div>
            </template>
        </template>
    </Page>
</template>

<script setup lang="ts">
import { translate, UI } from '@aerogel/core';
import { computedModels, useModelCollection } from '@aerogel/plugin-solid';
import { arrayReversed } from '@noeldemartin/utils';
import { TransitionGroup, useTemplateRef } from 'vue';

import Episode from '@/models/Episode';
import Movie from '@/models/Movie';
import Show from '@/models/Show';

const SAMPLE_MOVIES_LENGTH = 10;

const shows = useModelCollection(Show);
const movies = useModelCollection(Movie);
const $moviesGrid = useTemplateRef('moviesGrid');
const activeShows = computedModels(Show, () => shows.value.filter((show) => show.watchingStatus === 'watching'));
const pendingMovies = computedModels(Movie, () => {
    const sample: Movie[] = [];

    for (const movie of arrayReversed(movies.value)) {
        if (movie.watched) {
            continue;
        }

        sample.push(movie);

        if (sample.length === SAMPLE_MOVIES_LENGTH) {
            break;
        }
    }

    return sample;
});
const upcomingShows = computedModels(
    Show,
    () =>
        activeShows.value.filter((show) =>
            show.pendingEpisodes.value?.some(({ publishedAt }) => Episode.isUpcoming(publishedAt)),
        ),
    { watch: ['pendingEpisodes'] },
);
const moreMovies = translate('home.moreMovies', { link: `%LINK_PLACEHOLDER%` });
const moreMoviesParts = {
    start: moreMovies.split('%LINK_PLACEHOLDER%')[0] ?? '',
    end: moreMovies.split('%LINK_PLACEHOLDER%')[1] ?? '',
};

function positionAtMyCollection(el: HTMLElement) {
    const collectionMenu = document.getElementById('my-collection-menu');

    if (!collectionMenu || !$moviesGrid.value) {
        return;
    }

    const myCollectionRect = collectionMenu.getBoundingClientRect();
    const gridRect = $moviesGrid.value.$el.getBoundingClientRect();
    const top = myCollectionRect.top - gridRect.top + collectionMenu.clientHeight / 2;
    const left = myCollectionRect.left - gridRect.left + collectionMenu.clientWidth / 2;

    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
}

function sendMovieToCollection(movie: HTMLElement) {
    const { clientWidth, offsetTop, offsetLeft } = movie;

    movie.style.position = 'absolute';
    movie.style.width = `${clientWidth}px`;
    movie.style.top = `${offsetTop}px`;
    movie.style.left = `${offsetLeft}px`;
    movie.style.transformOrigin = 'top left';
    movie.style.pointerEvents = 'none';

    if (UI.mobile) {
        return;
    }

    requestAnimationFrame(() => {
        positionAtMyCollection(movie);

        movie.style.transform = 'scale(0.1) translate(-50%, -50%)';
    });
}
</script>
