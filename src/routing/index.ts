import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

import CollectionPage from '@/routing/pages/CollectionPage.vue';
import Error404Page from '@/routing/pages/Error404Page.vue';
import HomePage from '@/routing/pages/HomePage.vue';
import LoginPage from '@/routing/pages/LoginPage.vue';
import MoviePage from '@/routing/pages/MoviePage.vue';
import UnauthorizedPage from '@/routing/pages/UnauthorizedPage.vue';
import UnsupportedBrowserPage from '@/routing/pages/UnsupportedBrowserPage.vue';

import Storage from '@/utils/Storage';

export const routes = [
    { name: 'login', path: '/login', component: LoginPage },
    { name: 'home', path: '/', component: HomePage },
    { name: 'unauthorized', path: '/unauthorized', component: UnauthorizedPage },
    { name: 'unsupported-browser', path: '/unsupported-browser', component: UnsupportedBrowserPage },
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

export function getForcedRoute(): string | null {
    if (!Vue.instance)
        return null;

    const { $auth, $browser } = Vue.instance;

    if (!$browser.supported)
        return 'unsupported-browser';

    if (!$auth.loggedIn)
        return 'login';

    return null;
}

export function initRouter(router: VueRouter) {
    router.onReady(() => {
        const githubPagesRedirect = Storage.pull('github-pages-redirect');

        if (!githubPagesRedirect)
            return;

        router.replace(githubPagesRedirect);
    });

    router.beforeEach((to, _, next) => {
        const forcedRoute = getForcedRoute();

        if (forcedRoute !== null && to.name !== forcedRoute) {
            next({ name: forcedRoute });
            return;
        }

        next();
    });
}
