import { translate } from '@aerogel/core';
import routing, { defineRoutes } from '@aerogel/plugin-routing';

import StatsIndex from '@/pages/stats/Index.vue';

import Discover from './Discover.vue';
import Home from './Home.vue';

const routes = defineRoutes([
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

// oxlint-disable-next-line typescript/explicit-module-boundary-types
export default function () {
    return routing({ routes });
}
