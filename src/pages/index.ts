import { defineRouteBindings, defineRoutes } from '@aerogel/plugin-routing';

import Movie from '@/models/Movie.ts';

import Home from './Home.vue';
import MoviesIndex from './movies/Index.vue';
import MoviesShow from './movies/Show.vue';
import ShowsIndex from './shows/Index.vue';

export const bindings = defineRouteBindings({
    movie: Movie,
});

export default defineRoutes([
    { name: 'home', path: '/', component: Home },
    { name: 'movies.index', path: '/movies', component: MoviesIndex },
    {
        name: 'movies.show',
        path: '/movies/:movie',
        component: MoviesShow,
        title: ({ movie }) => (movie as Movie).title,
    },
    { name: 'shows.index', path: '/shows', component: ShowsIndex },
]);
