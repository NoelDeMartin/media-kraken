import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

import CollectionPage from '@/routing/pages/CollectionPage.vue';
import Error404Page from '@/routing/pages/Error404Page.vue';
import HomePage from '@/routing/pages/HomePage.vue';
import LoginPage from '@/routing/pages/LoginPage.vue';
import MoviePage from '@/routing/pages/MoviePage.vue';
import UnauthorizedPage from '@/routing/pages/UnauthorizedPage.vue';

export const routes = [
    { name: 'login', path: '/login', component: LoginPage },
    { name: 'home', path: '/', component: HomePage },
    { name: 'unauthorized', path: '/unauthorized', component: UnauthorizedPage },
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

export function initRouter(router: VueRouter) {
    router.onReady(() => {
        const githubPagesRedirect = localStorage.getItem('github-pages-redirect');

        if (!githubPagesRedirect)
            return;

        localStorage.removeItem('github-pages-redirect');

        router.replace(JSON.parse(githubPagesRedirect));
    });

    router.beforeEach((to, _, next) => {
        if (to.name !== 'login' && Vue.instance && !Vue.instance.$auth.isLoggedIn()) {
            next({ name: 'login' });
            return;
        }

        next();
    });
}
