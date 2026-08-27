import { defineRouteBindings, defineRoutes } from '@aerogel/plugin-routing';

import Movie from '@/models/Movie.ts';
import Show from '@/models/Show.ts';

import Discover from './Discover.vue';
import Home from './Home.vue';
import ListsIndex from './lists/Index.vue';
import MoviesIndex from './movies/Index.vue';
import MoviesShow from './movies/Show.vue';
import ShowsIndex from './shows/Index.vue';
import ShowsShow from './shows/Show.vue';

export const bindings = defineRouteBindings({
    movie: Movie,
    show: Show,
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
    {
        name: 'shows.show',
        path: '/shows/:show',
        component: ShowsShow,
        title: ({ show }) => (show as Show).name,
    },
    { name: 'lists.index', path: '/lists', component: ListsIndex },
    { name: 'discover', path: '/discover', component: Discover },
]);
