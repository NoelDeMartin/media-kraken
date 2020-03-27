import Vue from 'vue';
import VueRouter from 'vue-router';

import CollectionPage from '@/pages/CollectionPage.vue';
import Error404Page from '@/pages/Error404Page.vue';
import HomePage from '@/pages/HomePage.vue';
import LoginPage from '@/pages/LoginPage.vue';
import MoviePage from '@/pages/MoviePage.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    base: process.env.VUE_APP_PUBLIC_PATH,
    routes: [
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
    ],
});

router.beforeEach((to, from, next) => {
    if (to.name !== 'login' && Vue.instance && !Vue.instance.$auth.isLoggedIn()) {
        next({ name: 'login' });
        return;
    }

    next();
});

export default router;
