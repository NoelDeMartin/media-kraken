import Vue from 'vue';
import VueRouter from 'vue-router';

import { routes, initRouter } from '@/routing';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    base: process.env.VUE_APP_PUBLIC_PATH,
    routes,
});

initRouter(router);

export default router;
