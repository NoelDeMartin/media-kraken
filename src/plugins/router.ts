import Vue from 'vue';
import VueRouter from 'vue-router';

import AppLayout from '@/components/AppLayout.vue';

import Collection from '@/pages/Collection.vue';
import Home from '@/pages/Home.vue';
import Login from '@/pages/Login.vue';
import Movie from '@/pages/Movie.vue';
import NotFound from '@/pages/errors/404.vue';
import Search from '@/pages/Search.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        { name: 'login', path: '/login', component: Login },
        {
            path: '/',
            component: AppLayout,
            children: [
                { name: 'home', path: '', component: Home },
                { name: 'search', path: 'search', component: Search },
                { name: 'collection', path: 'collection', component: Collection },
                {
                    path: 'movies',
                    component: { render: h => h('router-view') },
                    children: [
                        { path: '/', redirect: { name: 'collection' } },
                        {
                            name: 'movie',
                            path: ':uuid',
                            component: Movie,
                            props: route => ({ movieUuid: route.params.uuid }),
                        },
                    ],
                },
                { path: '*', component: NotFound },
            ],
        },
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
