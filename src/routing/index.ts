import { RouteConfig } from 'vue-router';

import CollectionPage from '@/routing/pages/CollectionPage.vue';
import Error404Page from '@/routing/pages/Error404Page.vue';
import HomePage from '@/routing/pages/HomePage.vue';
import LoginPage from '@/routing/pages/LoginPage.vue';
import MoviePage from '@/routing/pages/MoviePage.vue';

export default [
    { name: 'login', path: '/login', component: LoginPage },
    { name: 'home', path: '/', component: HomePage },
    { name: 'collection', path: '/collection', component: CollectionPage },
    {
        path: '/movies',
        component: { render: h => h('router-view') },
        children: [
            { path: '/', redirect: { name: 'collection' } },
            {
                name: 'movie',
                path: ':uuid',
                component: MoviePage,
                props: route => ({ movieUuid: route.params.uuid }),
            },
        ],
    },
    { path: '*', component: Error404Page },
] as RouteConfig[];
