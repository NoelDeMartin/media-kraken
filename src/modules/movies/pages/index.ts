import { translate } from '@aerogel/core';
import { defineRouteBindings, defineRoutes } from '@aerogel/plugin-routing';

import Movie from '@movies/models/Movie';

import MoviesIndex from './Index.vue';
import MoviesShow from './Show.vue';

export const bindings = defineRouteBindings({
    movie: Movie,
});

export default defineRoutes([
    {
        name: 'movies.index',
        path: '/movies',
        component: MoviesIndex,
        title: () => translate('movies.title'),
    },
    {
        name: 'movies.show',
        path: '/movies/:movie',
        component: MoviesShow,
        title: ({ movie }) => (movie as Movie).title,
    },
]);
