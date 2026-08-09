import { defineRoutes } from '@aerogel/plugin-routing';

import Home from './Home.vue';
import MoviesIndex from './movies/Index.vue';
import ShowsIndex from './shows/Index.vue';

export default defineRoutes([
    { name: 'home', path: '/', component: Home },
    { name: 'movies.index', path: '/movies', component: MoviesIndex },
    { name: 'shows.index', path: '/shows', component: ShowsIndex },
]);
