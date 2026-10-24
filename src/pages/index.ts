import { translate } from '@aerogel/core';
import { defineRoutes } from '@aerogel/plugin-routing';

import StatsIndex from '@/pages/stats/Index.vue';

import Discover from './Discover.vue';
import Home from './Home.vue';

export default defineRoutes([
    { name: 'home', path: '/', component: Home },
    {
        name: 'stats.index',
        path: '/stats',
        component: StatsIndex,
        title: () => translate('stats.title'),
    },
    {
        name: 'discover',
        path: '/discover',
        component: Discover,
        title: () => translate('discover.title'),
    },
]);
