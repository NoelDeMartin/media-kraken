import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '@/pages/Home.vue';
import Main from '@/pages/layouts/Main.vue';
import NotFound from '@/pages/errors/404.vue';
import Login from '@/pages/Login.vue';
import Movie from '@/pages/Movie.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        { name: 'login', path: '/login', component: Login },
        {
            path: '/',
            component: Main,
            children: [
                { name: 'home', path: '', component: Home },
                {
                    name: 'movie',
                    path: 'movies/:uuid',
                    component: Movie,
                    props: route => ({ movieUuid: route.params.uuid }),
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
