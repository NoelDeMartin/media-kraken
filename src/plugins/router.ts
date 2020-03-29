import Vue from 'vue';
import VueRouter from 'vue-router';

import routes from '@/routing';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    base: process.env.VUE_APP_PUBLIC_PATH,
    routes,
});

router.beforeEach((to, from, next) => {
    if (to.name !== 'login' && Vue.instance && !Vue.instance.$auth.isLoggedIn()) {
        next({ name: 'login' });
        return;
    }

    next();
});

export default router;
