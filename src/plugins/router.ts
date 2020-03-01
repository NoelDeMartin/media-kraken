import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '@/pages/Home.vue';
import Login from '@/pages/Login.vue';
import Master from '@/pages/layouts/Master.vue';
import MoviesIndex from '@/pages/movies/Index.vue';
import MoviesShow from '@/pages/movies/Show.vue';
import NotFound from '@/pages/errors/404.vue';
import Search from '@/pages/Search.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        { name: 'login', path: '/login', component: Login },
        {
            path: '/',
            component: Master,
            children: [
                { name: 'home', path: '', component: Home },
                { name: 'search', path: 'search', component: Search },
                {
                    path: 'movies',
                    component: { render: h => h('router-view') },
                    children: [
                        { name: 'movies.index', path: '/', component: MoviesIndex },
                        {
                            name: 'movies.show',
                            path: ':uuid',
                            component: MoviesShow,
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
